export const brandConfig = {
    name: "MONTS",
    tagline: "Clean, fast, and focused on sales. Luxury Ready-to-Wear Fashion.",
    contact: {
        phone: "8290985337",
        email: "vastrabymonty@gmail.com",
        address: "Faridabad, Haryana",
        hours: "24/7 Customer Support",
    },
    socials: [
        {
            name: "Instagram",
            url: "https://instagram.com",
            handle: "@montsofficieller",
        },
        {
            name: "Facebook",
            url: "https://facebook.com",
            handle: "MONTS Store",
        },
    ],
    features: [
        {
            id: "returns",
            title: "Free returns",
            description: "Returns within 30 days receive a full refund.",
            icon: "RotateCcw",
        },
        {
            id: "shipping",
            title: "Worldwide shipping",
            description: "Ship anywhere, rates available at checkout.",
            icon: "Globe",
        },
        {
            id: "support",
            title: "24/7 support",
            description: "Call us anytime at 1(800) 555-1234.",
            icon: "Headphones",
        },
    ],
    currencies: [
        { code: "INR", symbol: "Rs.", label: "INR (Rs.)" },
        { code: "USD", symbol: "$", label: "USD ($)" },
        { code: "EUR", symbol: "€", label: "EUR (€)" },
    ],
    defaultCurrency: "INR",
    freeShippingThreshold: 2000, // Rs. 2000 for free shipping indicator
};
