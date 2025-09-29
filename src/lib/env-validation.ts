/**
 * Environment Variable Security Validation
 * 
 * This module validates all environment variables at startup to ensure
 * secure configuration and prevent runtime issues with missing secrets.
 */

interface EnvironmentConfig {
  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: string;
  
  // Database
  DATABASE_URL: string;
  
  // OpenAI
  OPENAI_API_KEY: string;
  
  // Optional: Clerk Webhook
  CLERK_WEBHOOK_SECRET?: string;
  
  // Environment
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validates individual environment variables
 */
class EnvironmentValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validates a required environment variable
   */
  validateRequired(key: keyof EnvironmentConfig, value: string | undefined): string {
    if (!value || value.trim() === '') {
      this.errors.push(`Missing required environment variable: ${key}`);
      return '';
    }
    return value.trim();
  }

  /**
   * Validates an optional environment variable
   */
  validateOptional(key: keyof EnvironmentConfig, value: string | undefined): string | undefined {
    if (!value || value.trim() === '') {
      return undefined;
    }
    return value.trim();
  }

  /**
   * Validates Clerk publishable key format
   */
  validateClerkPublishableKey(value: string): string {
    if (!value.startsWith('pk_test_') && !value.startsWith('pk_live_')) {
      this.errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_test_ or pk_live_');
    }
    return value;
  }

  /**
   * Validates Clerk secret key format
   */
  validateClerkSecretKey(value: string): string {
    if (!value.startsWith('sk_test_') && !value.startsWith('sk_live_')) {
      this.errors.push('CLERK_SECRET_KEY must start with sk_test_ or sk_live_');
    }
    return value;
  }

  /**
   * Validates OpenAI API key format
   */
  validateOpenAIKey(value: string): string {
    if (!value.startsWith('sk-')) {
      this.errors.push('OPENAI_API_KEY must start with sk-');
    }
    if (value.length < 20) {
      this.errors.push('OPENAI_API_KEY appears to be too short');
    }
    return value;
  }

  /**
   * Validates database URL format
   */
  validateDatabaseURL(value: string): string {
    try {
      const url = new URL(value);
      if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
        this.errors.push('DATABASE_URL must use postgres:// or postgresql:// protocol');
      }
      if (!url.hostname) {
        this.errors.push('DATABASE_URL must include a hostname');
      }
      if (!url.pathname || url.pathname === '/') {
        this.errors.push('DATABASE_URL must include a database name');
      }
    } catch {
      this.errors.push('DATABASE_URL is not a valid URL');
    }
    return value;
  }

  /**
   * Validates URL format
   */
  validateURL(key: keyof EnvironmentConfig, value: string): string {
    if (!value.startsWith('/') && !value.startsWith('http')) {
      this.warnings.push(`${key} should be a valid URL or path starting with /`);
    }
    return value;
  }

  /**
   * Security checks for development vs production
   */
  validateEnvironmentSecurity(config: EnvironmentConfig): void {
    if (config.NODE_ENV === 'production') {
      // Production security checks
      if (config.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_test_')) {
        this.warnings.push('Using test Clerk keys in production environment');
      }
      if (config.CLERK_SECRET_KEY.startsWith('sk_test_')) {
        this.warnings.push('Using test Clerk secret in production environment');
      }
      
      // Check for placeholder values
      if (config.OPENAI_API_KEY.includes('your_') || config.OPENAI_API_KEY.includes('placeholder')) {
        this.errors.push('OPENAI_API_KEY contains placeholder text in production');
      }
    }

    // Check for development warnings
    if (config.NODE_ENV === 'development') {
      if (!config.CLERK_WEBHOOK_SECRET) {
        this.warnings.push('CLERK_WEBHOOK_SECRET not set - webhooks will not work');
      }
    }
  }

  /**
   * Returns validation results
   */
  getResults(): { isValid: boolean; errors: string[]; warnings: string[] } {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

/**
 * Validates and returns the environment configuration
 */
export function validateEnvironment(): EnvironmentConfig {
  const validator = new EnvironmentValidator();
  
  const config: EnvironmentConfig = {
    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: validator.validateClerkPublishableKey(
      validator.validateRequired('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    ),
    CLERK_SECRET_KEY: validator.validateClerkSecretKey(
      validator.validateRequired('CLERK_SECRET_KEY', process.env.CLERK_SECRET_KEY)
    ),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: validator.validateURL(
      'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
      validator.validateRequired('NEXT_PUBLIC_CLERK_SIGN_IN_URL', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL)
    ),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: validator.validateURL(
      'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
      validator.validateRequired('NEXT_PUBLIC_CLERK_SIGN_UP_URL', process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL)
    ),
    NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: validator.validateURL(
      'NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL',
      validator.validateRequired('NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL', process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL)
    ),
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: validator.validateURL(
      'NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL',
      validator.validateRequired('NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL', process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL)
    ),
    
    // Database
    DATABASE_URL: validator.validateDatabaseURL(
      validator.validateRequired('DATABASE_URL', process.env.DATABASE_URL)
    ),
    
    // OpenAI
    OPENAI_API_KEY: validator.validateOpenAIKey(
      validator.validateRequired('OPENAI_API_KEY', process.env.OPENAI_API_KEY)
    ),
    
    // Optional
    CLERK_WEBHOOK_SECRET: validator.validateOptional('CLERK_WEBHOOK_SECRET', process.env.CLERK_WEBHOOK_SECRET),
    
    // Environment
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig['NODE_ENV']) || 'development'
  };

  // Additional security validation
  validator.validateEnvironmentSecurity(config);

  const results = validator.getResults();

  // Log warnings
  if (results.warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:');
    results.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Throw error if validation failed
  if (!results.isValid) {
    console.error('❌ Environment Configuration Errors:');
    results.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Invalid environment configuration. Please check your .env.local file.`);
  }

  console.log('✅ Environment configuration validated successfully');
  return config;
}

// Export validated configuration
export const env = validateEnvironment();
