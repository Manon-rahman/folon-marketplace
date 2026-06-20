'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'bn'

const translations = {
  en: {
    // Header
    appName: 'Folon Market',
    // Home
    tagline: 'Fresh picks, fast delivery',
    taglineSub: 'Order now, delivered to your door',
    allCategories: 'All',
    noProducts: 'No products yet',
    noProductsSub: 'Check back soon',
    // Product card
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    soldOut: 'Sold out',
    addedToCart: 'Added!',
    inStock: '✓ In stock',
    outOfStock: 'Out of stock',
    // Cart
    yourCart: 'Your Cart',
    items: 'items',
    emptyCart: 'Your cart is empty',
    emptyCartSub: 'Add some products to get started',
    browseProducts: 'Browse Products',
    subtotal: 'Subtotal',
    proceedToCheckout: 'Proceed to Checkout',
    // Checkout
    checkout: 'Checkout',
    deliveryInfo: 'Delivery Info',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your name',
    phone: 'Phone Number',
    phonePlaceholder: '01XXXXXXXXX',
    area: 'Delivery Area',
    areaPlaceholder: 'e.g. Gulshan, Dhaka',
    promoCode: 'Promo Code',
    promoPlaceholder: 'Enter promo code',
    apply: 'Apply',
    remove: 'Remove',
    youSave: 'You save',
    payment: 'Payment',
    orderSummary: 'Order Summary',
    discount: 'Discount',
    total: 'Total',
    placeOrder: 'Place Order',
    payWithBkash: 'Pay with bKash',
    youMightAlsoLike: 'You might also like',
    addToOrder: 'Add to order',
    // Confirmation
    orderPlaced: 'Order Placed!',
    paymentConfirmed: 'Payment Confirmed!',
    codMessage: "Pay on delivery. We'll call you to confirm.",
    paymentSuccess: 'Your payment was successful.',
    continueShopping: 'Continue Shopping',
    deliveryTo: 'Delivery To',
    // PDP
    back: 'Back',
    // Failed
    paymentFailed: 'Payment Failed',
    paymentFailedSub: 'Your payment was not completed. Your cart is still saved.',
    tryAgain: 'Try Again',
    // Validation
    nameRequired: 'Name is required',
    phoneRequired: 'Valid phone number required',
    areaRequired: 'Area is required',
    // Filters
    filterButton: 'Filter',
    sortBy: 'Sort by',
    filterNewest: 'Newest',
    filterTopSelling: 'Top Selling',
    filterPriceLow: 'Price: Low → High',
    filterPriceHigh: 'Price: High → Low',
    filterInStock: 'In Stock',
    // Product grid
    productsHeading: 'Products',
    noProductsMatch: 'No products match',
    tryRemovingFilter: 'Try removing a filter',
  },
  bn: {
    // Header
    appName: 'ফোলন মার্কেট',
    // Home
    tagline: 'তাজা পণ্য, দ্রুত ডেলিভারি',
    taglineSub: 'এখনই অর্ডার করুন, দরজায় পৌঁছে দেব',
    allCategories: 'সব',
    noProducts: 'এখনো কোনো পণ্য নেই',
    noProductsSub: 'শীঘ্রই আসছে',
    // Product card
    addToCart: 'কার্টে যোগ করুন',
    buyNow: 'এখনই কিনুন',
    soldOut: 'শেষ হয়ে গেছে',
    addedToCart: 'যোগ হয়েছে!',
    inStock: '✓ পাওয়া যাচ্ছে',
    outOfStock: 'স্টক নেই',
    // Cart
    yourCart: 'আপনার কার্ট',
    items: 'টি পণ্য',
    emptyCart: 'কার্ট খালি আছে',
    emptyCartSub: 'কেনাকাটা শুরু করতে পণ্য যোগ করুন',
    browseProducts: 'পণ্য দেখুন',
    subtotal: 'উপমোট',
    proceedToCheckout: 'চেকআউটে যান',
    // Checkout
    checkout: 'চেকআউট',
    deliveryInfo: 'ডেলিভারি তথ্য',
    fullName: 'পূর্ণ নাম',
    fullNamePlaceholder: 'আপনার নাম',
    phone: 'ফোন নম্বর',
    phonePlaceholder: '০১XXXXXXXXX',
    area: 'ডেলিভারি এলাকা',
    areaPlaceholder: 'যেমন: গুলশান, ঢাকা',
    promoCode: 'প্রমো কোড',
    promoPlaceholder: 'প্রমো কোড লিখুন',
    apply: 'প্রয়োগ করুন',
    remove: 'সরান',
    youSave: 'আপনি সাশ্রয় করছেন',
    payment: 'পেমেন্ট',
    orderSummary: 'অর্ডার সারসংক্ষেপ',
    discount: 'ছাড়',
    total: 'মোট',
    placeOrder: 'অর্ডার দিন',
    payWithBkash: 'bKash দিয়ে পেমেন্ট করুন',
    youMightAlsoLike: 'আপনার পছন্দ হতে পারে',
    addToOrder: 'অর্ডারে যোগ করুন',
    // Confirmation
    orderPlaced: 'অর্ডার সম্পন্ন!',
    paymentConfirmed: 'পেমেন্ট নিশ্চিত!',
    codMessage: 'ডেলিভারিতে পেমেন্ট করুন। আমরা কল করে নিশ্চিত করব।',
    paymentSuccess: 'আপনার পেমেন্ট সফল হয়েছে।',
    continueShopping: 'কেনাকাটা চালিয়ে যান',
    deliveryTo: 'ডেলিভারি যাচ্ছে',
    // PDP
    back: 'পেছনে',
    // Failed
    paymentFailed: 'পেমেন্ট ব্যর্থ হয়েছে',
    paymentFailedSub: 'পেমেন্ট সম্পন্ন হয়নি। আপনার কার্ট সংরক্ষিত আছে।',
    tryAgain: 'আবার চেষ্টা করুন',
    // Validation
    nameRequired: 'নাম আবশ্যক',
    phoneRequired: 'সঠিক ফোন নম্বর দিন',
    areaRequired: 'এলাকা আবশ্যক',
    // Filters
    filterButton: 'ফিল্টার',
    sortBy: 'সাজান',
    filterNewest: 'নতুন',
    filterTopSelling: 'সেরা বিক্রয়',
    filterPriceLow: 'দাম: কম → বেশি',
    filterPriceHigh: 'দাম: বেশি → কম',
    filterInStock: 'স্টকে আছে',
    // Product grid
    productsHeading: 'পণ্যসমূহ',
    noProductsMatch: 'কোনো পণ্য পাওয়া যায়নি',
    tryRemovingFilter: 'ফিল্টার সরিয়ে দেখুন',
  },
} as const

export type Translations = { readonly [K in keyof typeof translations.en]: string }

const LangContext = createContext<{
  lang: Lang
  t: Translations
  toggle: () => void
}>({ lang: 'en', t: translations.en, toggle: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('fm_lang') as Lang | null
    if (saved === 'bn') setLang('bn')
  }, [])

  function toggle() {
    setLang((prev) => {
      const next = prev === 'en' ? 'bn' : 'en'
      localStorage.setItem('fm_lang', next)
      return next
    })
  }

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export function useT() {
  return useContext(LangContext)
}
