// Detect timestamp format from input text
function detectFormat(input) {
  const text = input.trim()
  
  // Check for Unix seconds (10 digits)
  if (/^\d{10}$/.test(text)) {
    return 'unixSeconds'
  }
  
  return null
}

// Parse Unix seconds timestamp
function parseUnixSeconds(input) {
  try {
    const timestamp = parseInt(input, 10)
    if (isNaN(timestamp)) return null
    
    // Validate reasonable Unix timestamp range (after 2000, before 2100)
    if (timestamp < 946684800 || timestamp > 4102444800) return null
    
    const date = new Date(timestamp * 1000)
    // Verify the date is valid
    if (isNaN(date.getTime())) return null
    
    return date
  } catch (error) {
    return null
  }
}

// Map timezone acronyms to IANA timezone identifiers
function getIANATimezone(acronym) {
  const timezoneMap = {
    'UTC': 'UTC',
    'GMT': 'GMT',
    'WET': 'Europe/Lisbon',
    'CET': 'Europe/Paris',
    'EET': 'Europe/Helsinki',
    'SAST': 'Africa/Johannesburg',
    'MSK': 'Europe/Moscow',
    'TRT': 'Europe/Istanbul',
    'IRST': 'Asia/Tehran',
    'GST': 'Asia/Dubai',
    'AMT': 'Asia/Yerevan',
    'AFT': 'Asia/Kabul',
    'PKT': 'Asia/Karachi',
    'IST': 'Asia/Kolkata',
    'NPT': 'Asia/Kathmandu',
    'BTT': 'Asia/Thimphu',
    'BST': 'Asia/Dhaka',
    'MMT': 'Asia/Yangon',
    'ICT': 'Asia/Bangkok',
    'WIB': 'Asia/Jakarta',
    'CST': 'Asia/Shanghai',
    'HKT': 'Asia/Hong_Kong',
    'JST': 'Asia/Tokyo',
    'KST': 'Asia/Seoul',
    'ACST': 'Australia/Adelaide',
    'AEST': 'Australia/Sydney',
    'VLAT': 'Asia/Vladivostok',
    'SBT': 'Pacific/Guadalcanal',
    'NZST': 'Pacific/Auckland',
    'FJT': 'Pacific/Fiji',
    'CHAST': 'Pacific/Chatham',
    'TOT': 'Pacific/Tongatapu',
    'PHOT': 'Pacific/Enderbury',
    'LINT': 'Pacific/Kiritimati',
    'NST': 'America/St_Johns',
    'AST': 'America/Halifax',
    'EST': 'America/New_York',
    'MST': 'America/Denver',
    'PST': 'America/Los_Angeles'
  }
  
  return timezoneMap[acronym] || 'UTC'
}

// Format custom ISO pattern
function formatCustomISO(date, pattern, timezone) {
  // Get date components in the specified timezone
  const options = {
    timeZone: getIANATimezone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date)
  const partsMap = {}
  parts.forEach(part => {
    partsMap[part.type] = part.value
  })
  
  // Replace pattern tokens with actual values
  let result = pattern
    .replace(/YYYY/g, partsMap.year)
    .replace(/MM/g, partsMap.month)
    .replace(/DD/g, partsMap.day)
    .replace(/HH/g, partsMap.hour)
    .replace(/mm/g, partsMap.minute)
    .replace(/ss/g, partsMap.second)
  
  return result
}

// Format date to specified output format
function formatOutput(date, outputFormat, timezone, customPattern) {
  if (outputFormat === 'customISO') {
    // Format using user-defined pattern
    return formatCustomISO(date, customPattern || 'YYYY-MM-DD HH:mm:ss', timezone)
  }
  
  // Default to ISO 8601 format
  if (timezone === 'UTC' || timezone === 'GMT') {
    return date.toISOString()
  } else {
    // For non-UTC timezones, create a custom ISO format
    return formatCustomISO(date, 'YYYY-MM-DDTHH:mm:ss.000Z', timezone)
  }
}

module.exports = {
  actions: [
    {
      title: "Convert Time",
      code(input, options) {
        try {
          const text = input.text ? input.text.trim() : ''
          
          // Validate input
          if (!text) {
            popclip.showText('No text selected')
            return
          }
          
          // Step 1: Detect format
          const detectedFormat = detectFormat(text)
          if (!detectedFormat) {
            popclip.showText('Could not detect timestamp format')
            return
          }
          
          // Step 2: Parse based on detected format
          let parsedDate = null
          if (detectedFormat === 'unixSeconds') {
            parsedDate = parseUnixSeconds(text)
          }
          
          if (!parsedDate) {
            popclip.showText('Invalid timestamp value')
            return
          }
          
          // Step 3: Format output
          const converted = formatOutput(parsedDate, options.outputFormat, options.timezone, options.customISO)
          if (!converted) {
            popclip.showText('Error formatting output')
            return
          }
          
          // Step 4: Show debug info (temporarily disable copy)
          // popclip.copyText(converted)
          popclip.showText('Format: ' + (options.outputFormat || 'default') + ' | Result: ' + converted.substring(0, 30))
          
        } catch (error) {
          // Enhanced error handling with more specific message
          popclip.showText('Error converting timestamp')
        }
      }
    }
  ]
}