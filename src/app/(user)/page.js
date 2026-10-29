import { Stack, Box, Grid, Typography, Link, Card, CardMedia, CardContent,  } from '@mui/material';

// Components
import Hero from 'src/components/_main/home/hero';
import WhyUs from '@/components/_main/home/why-us';
import TopBanners from '@/components/_main/home/banners';
import Categories from '@/components/_main/home/categories';
import Brands from '@/components/_main/home/brands';
import Shops from '@/components/_main/home/shops';
import Testimonials from 'src/components/_main/home/testimonials';
import ProductList from '@/components/_main/home/products';
import SubscriptionModal from 'src/components/_main/home/subscription';
import { formatPrice } from '@/utils/formatPrice';
import HeroSearch from '@/components/_main/home/hero-search';

import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DiscountIcon from "@mui/icons-material/Discount";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { BorderTop } from '@mui/icons-material';
import CategoryShowcase from '@/components/_main/home/category-showcase';

import GoodPlace from '@/components/_main/home/good-place';
import Marketplace from '@/components/_main/home/marketplace';

// API services (direct fetch here or via service layer)
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function IndexPage({catforhero }) {
  // Fetch all home data in parallel
  const [homeRes, categoriesRes, bestSellingRes, topRatedRes, featuredRes, brandsRes, shopsRes, reviewsRes, allCategoriesRes] =
    await Promise.all([
      fetch(`${baseUrl}/api/settings/home`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/home/categories`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/home/products/best-selling`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/home/products/top`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/home/products/featured`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/home/brands`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/shops?limit=8`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/home/reviews?limit=8`, { next: { revalidate: 60 } }),
      fetch(`${baseUrl}/api/all-categories`, { next: { revalidate: 60 } })
    ]);

  const [banners, categories, bestSellingProducts, topRatedProducts,featuredProducts, brands, shops, reviews, allCategories] =
    await Promise.all([
      homeRes.json(),
      categoriesRes.json(),
      bestSellingRes.json(),
      topRatedRes.json(),
      featuredRes.json(),
      brandsRes.json(),
      shopsRes.json(),
      reviewsRes.json(),
      allCategoriesRes.json()
    ]);

    const productsRes = await fetch(`${baseUrl}/api/products?limit=12`, { next: { revalidate: 60 } });
const products = await productsRes.json();

const features = [
  {
    icon: <LocalOfferIcon sx={{ fontSize: 40, color: "#FFA000" }} />,
    title: "Opportunity Discounts",
    description:
      "Tasigförsamhet beteendedesign. Mobile checkout. Vlig karttorpa.",
  },
  {
    icon: <DiscountIcon sx={{ fontSize: 40, color: "#FFA000" }} />,
    title: "Discount Codes",
    description:
      "Tasigförsamhet beteendedesign. Mobile checkout. Vlig karttorpa.",
  },
  {
    icon: <LocalShippingIcon sx={{ fontSize: 40, color: "#FFA000" }} />,
    title: "Free Delivery",
    description:
      "Tasigförsamhet beteendedesign. Mobile checkout. Vlig karttorpa.",
  },
  {
    icon: <CreditCardIcon sx={{ fontSize: 40, color: "#FFA000" }} />,
    title: "Secure payment methods",
    description:
      "Tasigförsamhet beteendedesign. Mobile checkout. Vlig karttorpa.",
  },
];


const cards = [
  {
    bg: "#d6ccc2",
    subtitle: "We sell what you need",
    title: "Because you deserve quality products",
    desc: "Come in and see the discounts, deals and more prepared for you!",
    image: "/images/about-1.png",
  },
  {
    bg: "#ccd5ae",
    subtitle: "Find everything you need",
    title: "A place to throw your worries away",
    desc: "Come in and see the discounts, deals and more prepared for you!",
     image: "/images/about-1.png",
  },
  {
    bg: "#f5d7b2",
    subtitle: "Where families come to shop",
    title: "Customer satisfaction is our passion",
    desc: "Come in and see the discounts, deals and more prepared for you!",
     image: "/images/about-1.png",
  },
  {
    bg: "#c9d6df",
    subtitle: "Don't worry, we have it",
    title: "Providing the best for our customers",
    desc: "Come in and see the discounts, deals and more prepared for you!",
     image: "/images/about-1.png",
  },
];


const posts = [
  {
    img: "/images/blog1.jpg",
    date: "30 Mar 2024",
    title: "How To Get Your Marketplace Flywheel Spinning",
    desc: "Bilmålväkt treskade inibel den mobilmissbruk deren jyn nöning osk heterostik i rel ultran.",
  },
  {
    img: "/images/blog2.jpg",
    date: "30 Mar 2024",
    title: "The Everything Marketplaces Podcast",
    desc: "Bilmålväkt treskade inibel den mobilmissbruk deren jyn nöning osk heterostik i rel ultran.",
  },
  {
    img: "/images/blog3.jpg",
    date: "30 Mar 2024",
    title: "5 Top Female Marketplace Investors To Know",
    desc: "Bilmålväkt treskade inibel den mobilmissbruk deren jyn nöning osk heterostik i rel ultran.",
  },
  {
    img: "/images/blog4.jpg",
    date: "30 Mar 2024",
    title: "A Deep Dive Into Marketplace Expansion",
    desc: "Bilmålväkt treskade inibel den mobilmissbruk deren jyn nöning osk heterostik i rel ultran.",
  },
];


  return (
    <Stack >
      <HeroSearch categories={allCategories?.data || []} />
        <Box
       sx={{
         background: '#fff',
         pb: 4,
         textAlign: 'center',
       }} ><GoodPlace  /> </Box>
<Marketplace categories={allCategories?.data || []} products={products?.data || []} />


 {/* <Box sx={{ py: 2, }}>
  <Stack
    direction="row"
    flexWrap="wrap"
    justifyContent="center"
    spacing={3}
  >
    {features.map((item, index) => (
      <Stack
        key={index}
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{
          width: {
            xs: "100%",   // 1 column
            sm: "48%",    // 2 column
            md: "30%",    // 3 column
            lg: "23%",    // 4 column ✅
          },
        }}
      >
        {item.icon}

        <Stack>
          <Typography variant="subtitle1" fontWeight="bold">
            {item.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {item.description}
          </Typography>
        </Stack>
      </Stack>
    ))}
  </Stack>
</Box> */}
      <ProductList sx={{
        background:"#fcfbf7 !important"
      }}
        title="Recently Viewed Products"
        path="?featured=true"
        data={featuredProducts?.data || []}
      />
  

        
    
      <ProductList sx={{
        background:"#fcfbf7 !important"
      }}
        title="Featured Products"
        description="Discover a curated selection of our most loved products — handpicked for quality, popularity, and style."
        path="?featured=true"
        data={featuredProducts?.data || []}
      />

<Box sx={{ borderTop: 1, borderColor: "#ccc", margin:"0 30px" }} />
      <ProductList
        title="Best Selling Products"
        description="Special products in this month"
        path="?top=1"
        data={bestSellingProducts?.data || []}
      />
  


      {Boolean(reviews?.data.length) && <Testimonials data={reviews?.data} />}
     
        
       <WhyUs />
      {/* <SubscriptionModal /> */}
    </Stack>
  );
}
