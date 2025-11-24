-- ============================================================================
-- RPC FUNCTION: check_mandatory_documents
-- Requirements: 4.4
-- ============================================================================
-- This function validates that all 6 mandatory documents are uploaded for a lead
-- Returns validation result with details about missing documents

CREATE OR REPLACE FUNCTION check_mandatory_documents(
  p_lead_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mandatory_docs TEXT[] := ARRAY[
    'aadhar_front',
    'aadhar_back',
    'bijli_bill',
    'bank_passbook',
    'cancelled_cheque',
    'pan_card'
  ];
  v_uploaded_docs TEXT[];
  v_missing_docs TEXT[];
  v_all_uploaded BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get all uploaded mandatory documents for this lead (only valid ones)
  SELECT ARRAY_AGG(DISTINCT document_category)
  INTO v_uploaded_docs
  FROM documents
  WHERE lead_id = p_lead_id
    AND type = 'mandatory'
    AND status = 'valid';

  -- Handle case where no documents are uploaded
  IF v_uploaded_docs IS NULL THEN
    v_uploaded_docs := ARRAY[]::TEXT[];
  END IF;

  -- Find missing documents
  SELECT ARRAY_AGG(doc)
  INTO v_missing_docs
  FROM UNNEST(v_mandatory_docs) AS doc
  WHERE doc != ALL(COALESCE(v_uploaded_docs, ARRAY[]::TEXT[]));

  -- Handle case where no documents are missing
  IF v_missing_docs IS NULL THEN
    v_missing_docs := ARRAY[]::TEXT[];
  END IF;

  -- Check if all mandatory documents are uploaded
  v_all_uploaded := (array_length(v_missing_docs, 1) IS NULL OR array_length(v_missing_docs, 1) = 0);

  -- Build result
  v_result := jsonb_build_object(
    'lead_id', p_lead_id,
    'all_uploaded', v_all_uploaded,
    'uploaded_count', array_length(v_uploaded_docs, 1),
    'required_count', array_length(v_mandatory_docs, 1),
    'uploaded_documents', v_uploaded_docs,
    'missing_documents', v_missing_docs
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_mandatory_documents(UUID) TO authenticated;

