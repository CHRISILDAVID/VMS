import { PricingBlock } from '../types';

/**
 * Computes the dynamic price for a booking based on the pricing blocks.
 * @param startTime 'HH:mm' or 'HH:mm:ss'
 * @param durationMinutes number of minutes
 * @param blocks Array of PricingBlock
 * @param defaultPricePerHourPaise fallback price per hour in paise (e.g., 40000)
 * @returns Total price in Rupees
 */
export function computeDynamicPrice(
  startTime: string,
  durationMinutes: number,
  blocks: PricingBlock[] = [],
  defaultPricePerHourPaise: number = 40000
): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const startTotalMins = startH * 60 + startM;
  
  let totalPaise = 0;
  
  for (let m = 0; m < durationMinutes; m++) {
    const currentMins = startTotalMins + m;
    
    // Find the block that covers this specific minute.
    let activeBlock = blocks.find(b => {
      const [bh, bm] = b.start_time.split(':').map(Number);
      const startB = bh * 60 + bm;
      
      let [eh, em] = b.end_time.split(':').map(Number);
      let endB = eh * 60 + em;
      
      // If end time is 00:00 or less than start, it wraps to next day
      if (endB <= startB) {
        endB += 24 * 60;
      }
      
      // Normalize current minute to a single 24 hour day (0 to 1439)
      const normalizedCurrentMins = currentMins % (24 * 60);
      
      if (startB < endB && endB <= 24 * 60) {
         // Standard block within a single day
         return normalizedCurrentMins >= startB && normalizedCurrentMins < endB;
      } else {
         // Block spans midnight
         const normalizedEnd = endB % (24 * 60);
         if (normalizedCurrentMins >= startB) return true;
         // Handle edge case where end is exactly 00:00 (which is 0 normalized, but really 24:00)
         if (normalizedEnd === 0 && normalizedCurrentMins < 24 * 60) return false; 
         if (normalizedCurrentMins < normalizedEnd) return true;
         return false;
      }
    });
    
    const pricePerHour = activeBlock ? activeBlock.price_per_hour : defaultPricePerHourPaise;
    const pricePerMinute = pricePerHour / 60;
    totalPaise += pricePerMinute;
  }
  
  return Math.round(totalPaise / 100);
}
