# Nandini Jewellers

**An Online Imitation Jewellery E-Commerce Platform**

Nandini Jewellers is a full-stack e-commerce web application designed to provide customers with a seamless online shopping experience for imitation jewellery. The platform includes product browsing, secure authentication, online payments, order management, and an administrative dashboard for managing store operations.

**Live Demo:** https://isbl-pr.vercel.app  
**GitHub Repository:** https://github.com/aditya-gore0125/ISBL

## Features

- **Product Catalogue:** Browse jewellery products, categories, and collections.
- **User Authentication:** Secure login and registration with role-based access.
- **Shopping & Orders:** Manage shopping activities and track order information.
- **Online Payments:** Integrated Razorpay payment gateway.
- **Admin Dashboard:** Manage products, categories, orders, and customer inquiries.
- **Product Media:** Cloudinary integration for product image uploads.
- **Contact & Support:** Contact form and customer inquiry management.
- **Responsive Design:** Optimized interface for desktop and mobile devices.
- **Security:** Server-side validation, protected routes, and request rate limiting.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web framework |
| React.js | User interface |
| Tailwind CSS | Styling and responsive design |
| MongoDB Atlas | Database |
| Mongoose | Database modelling |
| NextAuth.js | Authentication |
| Razorpay | Online payment processing |
| Cloudinary | Image storage and management |
| Zod | Data validation |
| Vercel | Deployment and hosting |

## Getting Started

### Prerequisites

Ensure that the following are installed or available:

- Node.js and npm
- Git
- MongoDB Atlas account or a MongoDB instance
- Razorpay account for payment integration
- Cloudinary account for image management

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aditya-gore0125/ISBL.git
   ```

2. Navigate to the project directory:

   ```bash
   cd ISBL
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file in the project root and configure the required environment variables.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Configuration

Configure the following variables according to your local setup and integrations. Use the variable names required by your existing application.

```env
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

If Upstash-based rate limiting is enabled, configure its required Redis environment variables as well.

**Important:** Never commit `.env.local` or expose database credentials, payment secrets, authentication secrets, or Cloudinary API secrets in your repository.

## Running the Application

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run the production server locally:

```bash
npm run start
```

## Deployment

The application can be deployed on Vercel.

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables in the project settings.
3. Ensure MongoDB Atlas permits connections from the deployment environment.
4. Configure the production authentication URL and payment gateway credentials.
5. Deploy the application and verify authentication, product loading, checkout, and administrative functionality.

Use Razorpay test credentials in development and test mode before enabling live payments.

## Project Structure

The application uses the Next.js App Router. Major areas include:

- `app/` — Pages, layouts, API routes, and application routing.
- `components/` — Reusable interface components.
- `lib/` — Database connections, utilities, and shared business logic.
- `models/` — MongoDB/Mongoose data models.
- `public/` — Static assets, logos, and images.

The exact contents may vary according to the current repository structure.

## Security

- Keep secrets in environment variables.
- Validate incoming data on the server.
- Protect administrative routes with appropriate authorization.
- Verify payment status on the server before finalizing orders.
- Use secure authentication and database access practices.
- Apply rate limiting to sensitive endpoints where configured.

## Project Information

**Project Name:** Nandini Jewellers  
**Project Type:** Full-Stack E-Commerce Web Application  
**Domain:** Imitation Jewellery Retail  
**Developer & Project Lead:** Aditya Gore  
**Repository:** [ISBL on GitHub](https://github.com/aditya-gore0125/ISBL)  
**Deployment:** [Vercel Live Demo](https://isbl-pr.vercel.app)

## License

This project is intended for educational and project-development purposes. Please contact the project owner for permission before redistributing or reusing proprietary project assets and content.

