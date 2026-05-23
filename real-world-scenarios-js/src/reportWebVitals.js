import { onCLS, onLCP, onINP, onFCP, onTTFB} from 'web-vitals';

export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onLCP(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}