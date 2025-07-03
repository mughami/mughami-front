# მუღამი Frontend

ეს პროექტი მოიცავს ავთენტიფიკაციის გვერდებს (შესვლა და რეგისტრაცია), რომლებიც აგებულია შემდეგი ტექნოლოგიებით:

- React
- TypeScript
- React Router
- React Hook Form
- Ant Design Icons
- Tailwind CSS

## ავთენტიფიკაციის გვერდები

### შესვლის გვერდი

- ელ-ფოსტის ველი ვალიდაციით
- პაროლის ველი ჩვენების/დამალვის ფუნქციონალით
- დამიმახსოვრე ოფცია
- დაგავიწყდათ პაროლი ბმული
- რეგისტრაციის გვერდზე გადასვლის ბმული

### რეგისტრაციის გვერდი

- მომხმარებლის სახელის ველი
- სახელისა და გვარის ველები
- ელ-ფოსტის ველი ვალიდაციით
- ტელეფონის ნომრის ველი ვალიდაციით
- პაროლისა და პაროლის დადასტურების ველები ვალიდაციით
- პაროლის ჩვენების/დამალვის ფუნქციონალი
- მომსახურების პირობებისა და კონფიდენციალურობის პოლიტიკის ბმულები
- შესვლის გვერდზე გადასვლის ბმული

## განვითარება

### Environment Variables

პროექტის გასაშვებად საჭიროა განსაზღვროთ environment variables:

1. Copy `config.env.example` to `.env.local`:

```bash
cp config.env.example .env.local
```

2. Edit `.env.local` and set your API URL:

```bash
VITE_API_URL=http://localhost:54321
```

### Available Environment Variables

- `VITE_API_URL`: The base URL for the API (default: http://localhost:54321)
- `VITE_NODE_ENV`: Environment name (development/production)

### Installation and Running

```bash
# დამოკიდებულებების ინსტალაცია
npm install

# განვითარების სერვერის გაშვება
npm run dev

# პროდუქციისთვის აგება
npm run build
```
