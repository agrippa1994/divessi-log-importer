export interface Authenticated {
  authenticated_alpha: boolean
  authenticated_beta: boolean
  authenticated_rental: boolean
  authenticated: true
  authenticated_message: string
  error_message_url: boolean
  error_message: boolean
  mid: number
  token: string
  can_change_mares_firmware_endpoint: boolean
  imperial: boolean
  privacy_info: Date
  privacy_required: boolean
  marketing_required: boolean
  privacy_settings_required: boolean
  authenticated_email: string
}

export interface AuthenticationError {
  authenticated_alpha: boolean
  authenticated_beta: boolean
  authenticated_rental: boolean
  authenticated: false
  authenticated_message: string
  error_message_url: boolean
  error_message: string
  can_change_mares_firmware_endpoint: boolean
}
