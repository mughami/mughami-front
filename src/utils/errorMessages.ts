import { isAxiosError } from 'axios';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'შეყვანილი მონაცემები არასწორია. გთხოვთ შეამოწმოთ ველები.',
  401: 'სესიის ვადა ამოიწურა. გთხოვთ თავიდან შეხვიდეთ სისტემაში.',
  403: 'თქვენ არ გაქვთ ამ ოპერაციის შესრულების უფლება.',
  404: 'მოთხოვნილი ინფორმაცია ვერ მოიძებნა.',
  409: 'ასეთი ჩანაწერი უკვე არსებობს.',
  422: 'მოწოდებული მონაცემები არასწორია. გთხოვთ შეამოწმოთ.',
  429: 'მოთხოვნების ლიმიტი ამოიწურა. გთხოვთ ცოტა ხანში სცადოთ.',
  500: 'სერვერის შეცდომა. გთხოვთ ცოტა ხანში სცადოთ.',
  502: 'სერვერი დროებით მიუწვდომელია. გთხოვთ ცოტა ხანში სცადოთ.',
  503: 'სერვისი დროებით მიუწვდომელია. გთხოვთ ცოტა ხანში სცადოთ.',
};

// Maps known backend error messages/codes to Georgian translations.
const API_ERROR_MESSAGES: Record<string, string> = {
  'Phone number is already taken': 'ეს ტელეფონის ნომერი უკვე გამოყენებულია.',
  'Email is already taken': 'ეს ელ-ფოსტა უკვე გამოყენებულია.',
  'Username is already taken': 'ეს მომხმარებლის სახელი უკვე გამოყენებულია.',
  'User already exists': 'ასეთი მომხმარებელი უკვე რეგისტრირებულია.',
  'Invalid credentials': 'არასწორი ელ-ფოსტა ან პაროლი.',
  'Invalid OTP': 'არასწორი დადასტურების კოდი.',
  'OTP expired': 'დადასტურების კოდის ვადა ამოიწურა.',
  'You have already completed this tournament': 'თქვენ უკვე გაიარეთ ეს ტურნირი.',
  ALREADY_EXISTS: 'ასეთი ჩანაწერი უკვე არსებობს.',
  INVALID_INPUT: 'შეყვანილი მონაცემები არასწორია.',
  UNAUTHORIZED: 'ავტორიზაცია საჭიროა.',
  FORBIDDEN: 'თქვენ არ გაქვთ ამ ოპერაციის შესრულების უფლება.',
  NOT_FOUND: 'მოთხოვნილი ინფორმაცია ვერ მოიძებნა.',
};

export function getErrorMessage(error: unknown, fallback?: string): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'კავშირის შეცდომა. გთხოვთ შეამოწმოთ ინტერნეტ კავშირი.';
    }

    const data = error.response.data as { message?: string; error?: string } | undefined;

    // Check specific backend message first
    if (data?.message && API_ERROR_MESSAGES[data.message]) {
      return API_ERROR_MESSAGES[data.message];
    }
    // Then check error code
    if (data?.error && API_ERROR_MESSAGES[data.error]) {
      return API_ERROR_MESSAGES[data.error];
    }
    // Fall back to status code mapping
    const msg = STATUS_MESSAGES[error.response.status];
    if (msg) return msg;
  }
  return fallback ?? 'დაფიქსირდა შეცდომა. გთხოვთ სცადოთ ხელახლა.';
}
