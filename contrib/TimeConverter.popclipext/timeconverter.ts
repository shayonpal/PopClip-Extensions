// #popclip
// name: Time Converter
// identifier: com.shayon.popclip.extension.time-converter
// description: Automatically detects timestamp formats and converts to your preferred format
// popclip version: 4225
// module: true

import type { ActionFunction } from '@popclip/types'

type Options = {
  outputFormat: string
  timezone: string
}

// Unix seconds detection pattern
const UNIX_SECONDS_PATTERN = /^\d{10}$/

// Detect timestamp format from input text
function detectFormat(input: string): string | null {
  const text = input.trim()
  
  // Check for Unix seconds (10 digits)
  if (UNIX_SECONDS_PATTERN.test(text)) {
    return 'unixSeconds'
  }
  
  return null
}

// Parse Unix seconds timestamp
function parseUnixSeconds(input: string): Date | null {
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

// Format date to specified output format
function formatOutput(date: Date, outputFormat: string, timezone: string): string {
  // For MVP, only support ISO 8601 format
  if (outputFormat === 'iso8601' || !outputFormat) {
    if (timezone === 'UTC') {
      return date.toISOString()
    }
    // For non-UTC timezones, use basic ISO format for now (MVP limitation)
    return date.toISOString()
  }
  
  // Fallback to ISO 8601
  return date.toISOString()
}

// Main action function
const action: ActionFunction<Options> = (input, options) => {
  try {
    const text = input.text?.trim()
    
    // Validate input
    if (!text) {
      popclip.showText('No text selected', { preview: true })
      return
    }
    
    // Step 1: Detect format
    const detectedFormat = detectFormat(text)
    if (!detectedFormat) {
      popclip.showText('Could not detect timestamp format', { preview: true })
      return
    }
    
    // Step 2: Parse based on detected format
    let parsedDate: Date | null = null
    if (detectedFormat === 'unixSeconds') {
      parsedDate = parseUnixSeconds(text)
    }
    
    if (!parsedDate) {
      popclip.showText('Invalid timestamp value', { preview: true })
      return
    }
    
    // Step 3: Format output
    const converted = formatOutput(parsedDate, options.outputFormat, options.timezone)
    if (!converted) {
      popclip.showText('Error formatting output', { preview: true })
      return
    }
    
    // Step 4: Copy to clipboard and show feedback
    popclip.copyText(converted)
    popclip.showText(`Converted Unix seconds to ${options.outputFormat || 'ISO 8601'}`, { preview: true })
    
  } catch (error) {
    // Enhanced error handling with more specific message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    popclip.showText(`Error: ${errorMessage}`, { preview: true })
  }
}

export default action