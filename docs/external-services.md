# External Services Setup

Required external services for MedInfo:

## 1. Google OAuth

**Purpose**: User authentication
**Setup**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
**Required**: Client ID, Client Secret, API Key

## 2. Cloudinary

**Purpose**: File storage for medical documents
**Setup**: [Cloudinary Console](https://cloudinary.com/console)
**Required**: Cloud Name, API Key, API Secret

## 3. Zoom API

**Purpose**: Video meeting creation
**Setup**: [Zoom App Marketplace](https://marketplace.zoom.us/)
**Required**: Account ID, Client ID, Client Secret

## 4. Email Service (Optional)

**Purpose**: Appointment reminders
**Recommended**: [Resend](https://resend.com/)
**Required**: API Key

## Quick Setup

1. Create accounts on each service
2. Copy API keys to `apps/backend/.env`
3. Configure redirect URIs and domains
4. Test each integration

For detailed setup instructions, see each service's documentation.
