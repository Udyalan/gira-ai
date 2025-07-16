// Google Analytics 4 E-commerce Events
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void
    fbq: (command: string, ...args: any[]) => void
    dataLayer: any[]
  }
}

// E-commerce Events para GA4
export const trackPurchase = (orderData: {
  transactionId: string
  value: number
  currency: string
  items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
    item_brand?: string
    item_variant?: string
  }>
  coupon?: string
  shipping?: number
  tax?: number
}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderData.transactionId,
      value: orderData.value,
      currency: orderData.currency,
      items: orderData.items,
      coupon: orderData.coupon,
      shipping: orderData.shipping,
      tax: orderData.tax
    })
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: orderData.value,
      currency: orderData.currency,
      contents: orderData.items.map(item => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price
      })),
      content_type: 'product',
      num_items: orderData.items.reduce((sum, item) => sum + item.quantity, 0)
    })
  }
}

export const trackAddToCart = (item: {
  currency: string
  value: number
  items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
    item_brand?: string
    item_variant?: string
  }>
}) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: item.currency,
      value: item.value,
      items: item.items
    })
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      value: item.value,
      currency: item.currency,
      contents: item.items.map(product => ({
        id: product.item_id,
        quantity: product.quantity,
        item_price: product.price
      })),
      content_type: 'product'
    })
  }
}

export const trackViewItem = (item: {
  currency: string
  value: number
  items: Array<{
    item_id: string
    item_name: string
    category: string
    price: number
    item_brand?: string
    item_variant?: string
  }>
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: item.currency,
      value: item.value,
      items: item.items
    })
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      value: item.value,
      currency: item.currency,
      contents: item.items.map(product => ({
        id: product.item_id,
        category: product.category,
        item_price: product.price
      })),
      content_type: 'product'
    })
  }
}

export const trackBeginCheckout = (checkoutData: {
  currency: string
  value: number
  items: Array<{
    item_id: string
    item_name: string
    category: string
    quantity: number
    price: number
  }>
  coupon?: string
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: checkoutData.currency,
      value: checkoutData.value,
      items: checkoutData.items,
      coupon: checkoutData.coupon
    })
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: checkoutData.value,
      currency: checkoutData.currency,
      contents: checkoutData.items.map(item => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price
      })),
      content_type: 'product',
      num_items: checkoutData.items.reduce((sum, item) => sum + item.quantity, 0)
    })
  }
}

export const trackSearch = (searchTerm: string, results?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      ...(results && { search_results: results })
    })
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchTerm,
      content_type: 'product'
    })
  }
}

export const trackWishlistAdd = (item: {
  item_id: string
  item_name: string
  category: string
  price: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_wishlist', {
      currency: 'BRL',
      value: item.price,
      items: [{
        item_id: item.item_id,
        item_name: item.item_name,
        category: item.category,
        price: item.price,
        item_brand: 'Malíbi'
      }]
    })
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToWishlist', {
      value: item.price,
      currency: 'BRL',
      contents: [{
        id: item.item_id,
        category: item.category,
        item_price: item.price
      }],
      content_type: 'product'
    })
  }
}

export const trackCouponApply = (couponCode: string, discount: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'coupon_apply', {
      coupon_code: couponCode,
      discount_amount: discount,
      currency: 'BRL'
    })
  }

  // Custom event para análise de cupons
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'promotion_apply', {
      event_category: 'engagement',
      event_label: couponCode,
      value: discount
    })
  }
}

export const trackSizeGuideUse = (productId: string, productName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'size_guide_use', {
      event_category: 'engagement',
      event_label: productName,
      custom_parameter_1: productId
    })
  }
}

export const trackReviewSubmit = (productId: string, rating: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'review_submit', {
      event_category: 'engagement',
      event_label: 'product_review',
      value: rating,
      custom_parameter_1: productId
    })
  }
}

// Google Tag Manager Events
export const trackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters)
  }

  // Também push para dataLayer para GTM
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...parameters
    })
  }
}

// Heat Maps e Session Recording
export const initHeatmapTools = () => {
  // Hotjar
  if (typeof window !== 'undefined') {
    (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments) }
      h._hjSettings = { hjid: process.env.NEXT_PUBLIC_HOTJAR_ID, hjsv: 6 }
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script'); r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
  }

  // Microsoft Clarity
  if (typeof window !== 'undefined') {
    (function(c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) }
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y)
    })(window, document, "clarity", "script", process.env.NEXT_PUBLIC_CLARITY_ID)
  }
}

// Performance Tracking
export const trackPagePerformance = (pageName: string) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    const paint = performance.getEntriesByType('paint')
    
    const metrics = {
      page_name: pageName,
      load_time: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      dom_content_loaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      dns_lookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
      connection_time: Math.round(navigation.connectEnd - navigation.connectStart),
      response_time: Math.round(navigation.responseEnd - navigation.requestStart)
    }

    if (window.gtag) {
      window.gtag('event', 'page_performance', metrics)
    }
  }
}

// User Engagement Tracking
export const trackEngagement = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    })
  }
}

// A/B Testing Support
export const trackExperiment = (experimentId: string, variant: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      custom_map: {
        custom_parameter_1: 'experiment_id',
        custom_parameter_2: 'experiment_variant'
      }
    })

    window.gtag('event', 'experiment_impression', {
      experiment_id: experimentId,
      experiment_variant: variant
    })
  }
}

// Enhanced E-commerce para remarketing
export const setupRemarketingData = (pageType: string, data: any) => {
  if (typeof window !== 'undefined') {
    const remarketingData: any = {
      page_type: pageType,
      business_vertical: 'retail'
    }

    switch (pageType) {
      case 'product':
        remarketingData.product_id = data.id
        remarketingData.page_type = 'product'
        break
      case 'category':
        remarketingData.category = data.category
        remarketingData.page_type = 'category'
        break
      case 'cart':
        remarketingData.total_value = data.total
        remarketingData.page_type = 'cart'
        break
      case 'purchase':
        remarketingData.transaction_id = data.orderId
        remarketingData.total_value = data.total
        remarketingData.page_type = 'purchase'
        break
    }

    if (window.gtag) {
      window.gtag('config', 'AW-CONVERSION_ID', remarketingData)
    }
  }
}