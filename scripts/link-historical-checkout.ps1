$ErrorActionPreference = 'Stop'
$endpoint = 'https://carbonpocketapp.vercel.app/api/contributor-backfill'
$paymentId = Read-Host 'Paid Stripe PaymentIntent (pi_...) or Checkout Session ID (cs_live_...)'
$displayName = Read-Host 'Public display name (ASCII fallback: Jo\u00e3o Mattos)'
$secureKey = Read-Host 'Temporary Vercel backfill key' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
  $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  while ($displayName -match '\\u([0-9a-fA-F]{4})') {
    $escapedCharacter = $Matches[0]
    $unicodeCode = [Convert]::ToInt32($Matches[1], 16)
    $displayName = $displayName.Replace($escapedCharacter, [string][char]$unicodeCode)
  }
  if ($paymentId -notmatch '^(cs_(live|test)_[A-Za-z0-9]+|pi_[A-Za-z0-9]+)$') {
    throw 'Enter a Stripe PaymentIntent ID (pi_...) or Checkout Session ID (cs_...).'
  }
  $json = @{
    action = 'link_historical_checkout'
    paymentId = $paymentId
    displayName = $displayName
  } | ConvertTo-Json -Compress
  $asciiJson = New-Object System.Text.StringBuilder
  foreach ($character in $json.ToCharArray()) {
    if ([int]$character -gt 127) {
      [void]$asciiJson.Append(('\u{0:x4}' -f [int]$character))
    } else {
      [void]$asciiJson.Append($character)
    }
  }
  $body = $asciiJson.ToString()
  $response = Invoke-RestMethod `
    -Uri $endpoint `
    -Method Post `
    -ContentType 'application/json; charset=utf-8' `
    -Headers @{ 'x-contributor-backfill-key' = $key } `
    -Body $body

  if (-not $response.linked) {
    throw 'The verified checkout was not linked.'
  }
  Write-Host 'HISTORICAL_CHECKOUT_LINKED'
  Write-Host ("created={0}; kg={1}" -f $response.created, $response.kg)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  $secureKey.Dispose()
  $key = $null
}
