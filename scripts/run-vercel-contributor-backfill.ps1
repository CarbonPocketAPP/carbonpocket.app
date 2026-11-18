$ErrorActionPreference = 'Stop'
$endpoint = 'https://carbonpocketapp.vercel.app/api/contributor-backfill'
$secureKey = Read-Host 'Temporary Vercel backfill key' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
$key = $null
$cursor = $null
$totals = @{ checkout = 0; invoice = 0; linkedAttestations = 0 }

try {
  $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  do {
    $body = @{ cursor = $cursor } | ConvertTo-Json -Compress -Depth 8
    $response = Invoke-RestMethod `
      -Uri $endpoint `
      -Method Post `
      -ContentType 'application/json' `
      -Headers @{ 'x-contributor-backfill-key' = $key } `
      -Body $body

    foreach ($name in $totals.Keys) {
      $totals[$name] += [int]$response.processed.$name
    }

    if ($response.done) {
      break
    }
    if ($null -eq $response.nextCursor) {
      throw 'The Vercel function returned no continuation cursor.'
    }

    $cursor = $response.nextCursor
    Write-Host ("Batch saved: checkouts={0}, invoices={1}, linked={2}" -f `
      $response.processed.checkout, `
      $response.processed.invoice, `
      $response.processed.linkedAttestations)
  } while ($true)

  Write-Host 'CONTRIBUTOR_LEDGER_BACKFILL_COMPLETE'
  Write-Host ($totals | ConvertTo-Json -Compress)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  $secureKey.Dispose()
  $key = $null
}
