import { Notice } from './ui'

export default function ConfidentialityNotice({ compact = false }) {
  return (
    <Notice tone="amber" title={compact ? 'Confidentiality Statement' : undefined}>
      <p>
        This portfolio is submitted for educational purposes as part of the Clinical Rotation
        Program. All patient information has been anonymized. No patient names, identifying
        details, photographs, hospital numbers, addresses, contact information, unredacted
        medical records, or patient images are included. Patient confidentiality and
        professional ethics were maintained in all entries.
      </p>
    </Notice>
  )
}
