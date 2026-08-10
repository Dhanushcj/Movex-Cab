import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote, MapPin, CreditCard } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
  {
    id: 1,
    name: 'Karthik Subramanian',
    role: 'Senior Software Engineer',
    avatar: '/renu.png',
    route: 'Chennai Central → Guindy',
    passType: 'Monthly Pass',
    rating: 5,
    quote: 'I stopped worrying about fluctuating surge pricing and daily ride costs. My monthly pass makes my office commute from Central to Guindy completely stress-free!'
  },
  {
    id: 2,
    name: 'Ananya Ramesh',
    role: 'Product Designer',
    avatar: '/renu.png',
    route: 'Egmore → Tambaram',
    passType: 'Weekly Pass',
    rating: 5,
    quote: 'The ability to take a Bike for quick trips and switch to an Auto or Cab when it rains on the same corridor without paying extra is revolutionary!'
  },
  {
    id: 3,
    name: 'Vikram Venkatesh',
    role: 'Financial Analyst',
    avatar: '/renu.png',
    route: 'Saidapet → Pallavaram',
    passType: 'Monthly Pass',
    rating: 5,
    quote: 'Saved over ₹3,400 last month alone! The route checker clearly tells me my corridor eligibility upfront. Forge India mobility pass is an absolute must-have.'
  },
  {
    id: 4,
    name: 'Priya Sundaram',
    role: 'Operations Lead',
    avatar: '/renu.png',
    route: 'Guindy → Tambaram',
    passType: 'Daily Pass',
    rating: 5,
    quote: 'Seamless experience every single day. Instant booking confirmation, zero surge charges, and super clean cabs. Best urban transit solution in South India.'
  }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 70 : -70,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 70 : -70,
    opacity: 0
  })
};

const Testimonials = () => {
  const [[page, direction], setPage] = useState([0, 1]);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const currentIndex = ((page % testimonials.length) + testimonials.length) % testimonials.length;

  const paginate = useCallback((newDirection) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  const goToIndex = (targetIndex) => {
    const diff = targetIndex - currentIndex;
    if (diff !== 0) {
      setPage([page + diff, diff > 0 ? 1 : -1]);
    }
  };

  // 2-second (2000ms) autoplay interval
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      paginate(1);
    }, 2000);

    return () => clearInterval(interval);
  }, [paginate, isHovered, page]);

  // Touch Swipe Gesture Handler
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold) {
      paginate(-1);
    }
  };

  const current = testimonials[currentIndex];

  return (
    <section 
      className={styles.testimonialsSection}
      aria-label="Rider Reviews Carousel"
      aria-roledescription="carousel"
    >
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>RIDER REVIEWS</span>
          <h2 className={styles.sectionTitle}>
            Loved by Daily <span className="forge-blue-text">Urban Riders</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            See how thousands of commuters are saving money and time with Forge mobility passes.
          </p>
        </div>

        {/* Testimonials Carousel Card */}
        <div 
          className={styles.carouselWrapper}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={styles.cardContainer}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 320, damping: 32, duration: shouldReduceMotion ? 0 : 0.6 },
                  opacity: { duration: shouldReduceMotion ? 0.1 : 0.4 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className={styles.testimonialCard}
                aria-live="polite"
                aria-roledescription="slide"
                aria-label={`Testimonial ${currentIndex + 1} of ${testimonials.length}`}
              >
                <div className={styles.quoteIconBox}>
                  <Quote size={32} className={styles.quoteIcon} />
                </div>

                <div className={styles.starsRow}>
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} size={18} className={styles.starIcon} fill="#E8C84A" stroke="#E8C84A" />
                  ))}
                </div>

                <p className={styles.quoteText}>"{current.quote}"</p>

                <div className={styles.cardBottomRow}>
                  <div className={styles.authorInfo}>
                    <img src={current.avatar} alt={current.name} className={styles.avatarImg} />
                    <div>
                      <h4 className={styles.authorName}>{current.name}</h4>
                      <span className={styles.authorRole}>{current.role}</span>
                    </div>
                  </div>

                  <div className={styles.routeMetaTags}>
                    <div className={styles.metaChip}>
                      <MapPin size={13} className={styles.metaIcon} />
                      <span>{current.route}</span>
                    </div>
                    <div className={styles.metaChipYellow}>
                      <CreditCard size={13} />
                      <span>{current.passType}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
