import React, { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Trophy, Star, AlertCircle, Smile, Zap, MapPin, 
  BookOpen, HelpCircle, Award, Compass, Eye, Check, X, RotateCw, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '../lib/storage';
import { getUserCredits } from '../lib/credits';

// Synthesize audio using Web Audio API so it runs without external audio assets
const playSynthSound = (type: 'correct' | 'incorrect' | 'complete' | 'tick' | 'pop') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'tick') {
      // Rapid drum tick/click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'pop') {
      // Pop sound when ball drops
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'correct') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1); // G5
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'incorrect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'complete') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.35);
      });
    }
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
};

interface Provincia {
  id: string;
  name: string;
  capital: string;
  detail: string;
  d: string;
}

// 32 regions of the Dominican Republic (31 provinces + 1 Distrito Nacional)
const PROVINCIAS: Provincia[] = [
  { id: "DO.PN", name: "Pedernales", capital: "Pedernales", detail: "Frontera sur, Bahía de las Águilas.", d: "M92.1,475.4 L88.9,476.4 L85.7,474.6 L85.7,470.3 L89.7,461.3 L95.1,464.9 L99.9,469.7 L97.0,470.5 Z M136.2,415.6 L134.2,421.0 L130.7,422.9 L129.4,426.9 L126.3,431.6 L119.6,450.3 L117.6,453.9 L109.6,464.9 L104.1,459.9 L91.2,438.1 L88.0,434.6 L81.6,432.0 L66.3,433.8 L59.8,432.2 L67.9,424.5 L69.2,422.0 L68.2,414.7 L63.3,405.8 L62.9,402.2 L64.3,394.7 L62.9,391.1 L59.6,387.2 L52.7,381.3 L42.1,377.2 L45.2,367.7 L44.6,356.3 L42.7,350.6 L43.0,344.8 L44.6,341.0 L53.2,326.6 L69.3,335.9 L85.5,344.2 L92.4,346.0 L99.0,348.8 L110.0,358.8 L115.9,362.3 L116.1,374.1 L114.6,379.8 L110.7,381.2 L109.4,383.0 L113.3,393.2 L122.7,401.1 L127.5,400.0 L133.2,400.3 L136.2,407.3 Z" },
  { id: "DO.AL", name: "La Altagracia", capital: "Higüey", detail: "Punta Cana, playas paradisíacas y Basílica.", d: "M627.4,353.9 L636.3,355.1 L646.2,354.8 L648.8,355.7 L652.9,362.2 L654.0,367.4 L644.9,363.9 L638.3,363.7 L629.1,366.0 L622.4,364.3 L617.6,360.0 L614.6,354.6 L612.9,349.7 L615.7,348.9 L619.1,349.5 Z M609.5,198.0 L613.0,193.4 L616.3,195.5 L621.7,196.5 L643.8,216.9 L651.9,226.7 L663.4,235.4 L671.6,241.1 L675.2,242.9 L683.8,251.2 L694.7,257.7 L700.0,265.7 L699.0,273.5 L681.2,300.7 L678.1,305.1 L678.5,312.0 L676.0,317.4 L672.8,319.0 L664.4,319.5 L660.9,318.3 L653.3,313.4 L650.6,312.6 L647.4,314.7 L649.0,321.7 L643.5,332.4 L640.6,344.0 L637.4,346.8 L621.3,348.1 L618.0,347.0 L617.5,339.7 L612.9,330.0 L606.5,320.6 L600.9,314.2 L594.9,310.0 L591.1,308.4 L597.8,291.2 L600.4,285.5 L600.2,279.2 L596.2,274.3 L591.4,269.9 L587.7,263.3 L584.6,256.1 L583.1,252.0 L583.9,247.7 L588.1,245.1 L593.2,244.3 L602.9,236.6 L606.8,225.3 L601.7,215.5 L604.1,202.2 Z" },
  { id: "DO.PV", name: "Peravia", capital: "Baní", detail: "Tierra de los mangos y hermosas dunas de Baní.", d: "M347.1,341.5 L339.4,342.2 L337.1,343.5 L333.7,341.4 L330.1,340.6 L305.7,340.5 L301.6,341.8 L293.7,346.2 L289.3,347.1 L276.0,347.0 L273.0,345.7 L272.7,344.0 L276.8,340.3 L276.3,338.1 L271.1,333.4 L281.7,331.5 L288.7,323.7 L288.3,318.0 L289.8,312.7 L291.7,309.0 L290.5,305.4 L295.7,297.8 L305.0,295.2 L309.8,291.9 L313.9,287.5 L323.1,291.6 L330.6,298.9 L336.6,301.8 L336.2,306.6 L331.3,309.4 L330.3,314.5 L337.6,323.5 L340.3,328.6 L345.2,333.2 Z" },
  { id: "DO.JO", name: "San José de Ocoa", capital: "San José de Ocoa", detail: "Valle Nuevo, ecoturismo montañoso.", d: "M313.9,287.5 L309.8,291.9 L305.0,295.2 L295.7,297.8 L290.5,305.4 L282.4,290.2 L276.3,287.0 L270.0,282.8 L265.6,281.2 L262.3,278.0 L260.9,275.1 L258.1,273.3 L254.2,263.2 L248.9,252.4 L265.9,252.4 L272.9,245.6 L277.9,239.3 L280.7,230.5 L288.6,235.2 L296.2,240.8 L301.0,240.4 L305.6,238.8 L310.7,240.9 L315.5,244.3 L311.9,252.4 L311.2,261.0 L311.9,268.0 L309.8,275.1 L311.1,281.6 Z" },
  { id: "DO.HM", name: "Hato Mayor", capital: "Hato Mayor", detail: "Cueva Fun Fun, Parque Los Haitises.", d: "M454.4,168.8 L456.8,170.6 L467.3,169.0 L470.9,170.3 L475.4,168.9 L484.3,172.4 L489.0,171.9 L486.3,170.0 L482.4,169.0 L482.4,167.6 L492.6,167.1 L495.5,167.7 L498.9,170.1 L501.5,176.3 L504.7,178.7 L514.4,180.4 L532.1,185.2 L531.0,196.9 L536.2,206.3 L520.6,202.6 L509.8,204.5 L516.6,218.4 L527.5,229.7 L530.5,237.7 L529.6,246.2 L526.3,253.8 L524.0,261.2 L517.5,265.7 L514.4,273.1 L504.9,284.7 L499.4,271.5 L490.7,258.3 L488.3,241.9 L485.0,235.6 L485.0,228.7 L488.4,224.0 L492.4,219.9 L499.9,215.0 L496.4,211.5 L489.5,210.6 L480.2,205.5 L459.9,195.3 L451.2,187.4 L453.7,181.7 L454.8,175.6 Z" },
  { id: "DO.MP", name: "Monte Plata", capital: "Monte Plata", detail: "Provincia esmeralda, Salto de Socoa.", d: "M451.2,187.4 L459.9,195.3 L480.2,205.5 L489.5,210.6 L496.4,211.5 L499.9,215.0 L492.4,219.9 L488.4,224.0 L485.0,228.7 L473.7,240.5 L462.8,259.4 L456.0,256.8 L449.5,258.2 L445.9,260.5 L441.8,261.4 L430.7,265.4 L421.9,274.5 L420.4,268.9 L416.4,265.0 L415.4,261.0 L408.4,252.7 L403.3,248.6 L394.5,248.1 L389.8,249.0 L388.4,252.6 L380.3,256.3 L371.4,254.5 L359.1,250.5 L355.6,244.2 L350.3,242.2 L340.8,236.0 L334.4,228.1 L335.8,221.9 L339.7,217.6 L357.6,213.7 L361.3,210.5 L366.3,209.3 L373.7,210.7 L376.0,207.2 L379.8,207.9 L386.0,211.0 L391.3,206.9 L394.7,193.9 L397.6,181.1 L402.7,181.3 L405.6,177.5 L406.2,172.2 L416.4,171.1 L428.8,171.6 L439.7,179.9 L445.7,183.3 Z" },
  { id: "DO.DU", name: "Duarte", capital: "San Francisco de Macorís", detail: "Tierra del cacao y Loma Quita Espuela.", d: "M428.8,171.6 L416.4,171.1 L406.2,172.2 L405.6,177.5 L402.7,181.3 L397.6,181.1 L399.3,175.6 L400.0,170.3 L396.0,167.7 L391.3,166.2 L379.3,165.7 L374.8,164.2 L365.7,160.0 L352.0,158.5 L343.6,158.6 L339.7,159.3 L332.0,157.5 L329.2,159.3 L319.8,153.0 L313.7,143.5 L313.9,135.0 L316.7,126.5 L318.3,117.1 L322.0,108.7 L330.0,104.9 L335.5,100.4 L338.2,88.9 L340.2,88.9 L342.2,89.3 L355.3,97.8 L357.5,104.2 L358.0,111.0 L360.3,119.4 L366.9,124.3 L372.6,125.1 L375.2,129.7 L384.3,137.6 L397.3,140.9 L410.1,146.9 L423.2,149.5 L432.5,145.2 L443.9,147.9 L443.9,153.3 L435.9,158.7 L433.3,161.8 L432.6,168.1 Z" },
  { id: "DO.MT", name: "María Trinidad Sánchez", capital: "Nagua", detail: "Playas hermosas de Nagua y Cabrera.", d: "M423.2,149.5 L410.1,146.9 L397.3,140.9 L384.3,137.6 L375.2,129.7 L372.6,125.1 L366.9,124.3 L360.3,119.4 L358.0,111.0 L357.5,104.2 L355.3,97.8 L342.2,89.3 L344.0,78.5 L352.5,78.6 L361.9,73.2 L365.5,62.9 L365.3,61.7 L371.6,55.0 L375.2,53.4 L393.2,53.5 L396.0,55.2 L402.4,62.0 L404.4,66.7 L404.3,71.7 L401.1,82.7 L404.9,84.3 L406.3,87.9 L406.2,97.0 L407.9,104.1 L420.4,123.0 L426.1,128.6 L424.9,134.9 L421.9,144.8 Z" },
  { id: "DO.SM", name: "Samaná", capital: "Samaná", detail: "Ballenas jorobadas, Las Terrenas y playas vírgenes.", d: "M451.2,187.4 L445.7,183.3 L439.7,179.9 L428.8,171.6 L432.6,168.1 L433.3,161.8 L435.9,158.7 L443.9,153.3 L443.9,147.9 L432.5,145.2 L423.2,149.5 L421.9,144.8 L424.9,134.9 L426.1,128.6 L433.2,131.9 L437.1,131.3 L444.5,128.5 L456.8,127.6 L464.4,125.2 L470.1,121.5 L474.2,121.5 L480.7,123.9 L485.3,122.8 L489.4,122.8 L491.0,125.6 L494.4,123.9 L505.4,128.4 L508.6,130.8 L510.8,126.5 L514.3,123.3 L522.9,118.5 L528.4,116.9 L529.7,119.2 L528.3,123.9 L525.5,129.6 L529.3,131.0 L533.5,130.9 L541.1,128.1 L542.2,132.5 L536.4,139.0 L533.8,146.1 L531.6,149.3 L528.3,151.7 L524.1,152.7 L509.3,150.0 L493.0,151.2 L489.1,150.1 L482.1,146.6 L457.9,143.5 L455.2,144.2 L454.2,146.9 L453.5,156.4 L452.1,164.5 L452.6,167.5 L454.4,168.8 L454.8,175.6 L453.7,181.7 Z" },
  { id: "DO.CR", name: "San Cristóbal", capital: "San Cristóbal", detail: "Cuna de la Constitución, Balneario La Toma.", d: "M381.0,305.1 L374.3,310.1 L371.1,315.1 L368.7,322.7 L364.3,325.0 L362.6,328.6 L356.1,334.6 L348.8,342.1 L347.1,341.5 L345.2,333.2 L340.3,328.6 L337.6,323.5 L330.3,314.5 L331.3,309.4 L336.2,306.6 L336.6,301.8 L330.6,298.9 L323.1,291.6 L313.9,287.5 L311.1,281.6 L309.8,275.1 L311.9,268.0 L311.2,261.0 L311.9,252.4 L315.5,244.3 L322.5,244.5 L325.2,236.9 L327.9,231.2 L334.4,228.1 L340.8,236.0 L350.3,242.2 L350.4,251.2 L355.5,259.5 L352.9,268.8 L354.9,275.9 L358.3,282.3 L363.0,285.8 L366.5,290.1 L367.0,293.5 L369.2,295.9 L377.8,296.0 L380.2,299.6 Z" },
  { id: "DO.NC", name: "Distrito Nacional", capital: "Santo Domingo", detail: "Capital de la República, Zona Colonial.", d: "M404.8,294.5 L400.9,295.5 L394.9,298.3 L389.9,301.6 L385.4,303.4 L386.5,296.1 L382.3,289.9 L382.9,284.2 L388.0,281.4 L392.6,288.4 L396.2,288.7 L399.8,287.8 L405.1,288.6 Z" },
  { id: "DO.SE", name: "El Seibo", capital: "El Seibo", detail: "Tierra del mabí, producción de carne y cacao.", d: "M524.0,261.2 L526.3,253.8 L529.6,246.2 L530.5,237.7 L527.5,229.7 L516.6,218.4 L509.8,204.5 L520.6,202.6 L536.2,206.3 L531.0,196.9 L532.1,185.2 L539.4,187.2 L542.4,187.0 L545.9,184.9 L542.4,182.1 L542.4,180.1 L545.8,179.2 L548.7,181.9 L552.7,188.3 L560.6,191.8 L561.9,193.9 L571.0,188.3 L569.5,186.7 L573.6,185.7 L576.2,182.8 L583.7,183.2 L587.7,184.0 L594.4,187.0 L595.7,189.7 L606.8,192.4 L613.0,193.4 L609.5,198.0 L604.1,202.2 L601.7,215.5 L606.8,225.3 L602.9,236.6 L593.2,244.3 L588.1,245.1 L583.9,247.7 L583.1,252.0 L584.6,256.1 L576.2,259.4 L571.5,268.6 L564.2,277.8 L554.6,283.7 L557.0,273.9 L551.4,273.3 L545.4,274.2 L540.0,270.2 L535.4,265.1 L529.1,264.6 Z" },
  { id: "DO.RO", name: "La Romana", capital: "La Romana", detail: "Altos de Chavón, Casa de Campo y turismo.", d: "M591.1,308.4 L587.0,306.7 L579.0,305.6 L569.9,309.3 L556.1,310.0 L555.0,304.4 L552.6,298.6 L549.1,294.0 L554.6,283.7 L564.2,277.8 L571.5,268.6 L576.2,259.4 L584.6,256.1 L587.7,263.3 L591.4,269.9 L596.2,274.3 L600.2,279.2 L600.4,285.5 L597.8,291.2 Z" },
  { id: "DO.ST", name: "Santiago", capital: "Santiago de los Caballeros", detail: "Cuna del tabaco, Monumento a los Héroes.", d: "M149.1,152.7 L150.2,146.5 L150.0,140.4 L146.9,137.4 L146.3,133.2 L147.6,121.0 L150.3,117.4 L156.2,111.9 L159.1,110.0 L166.2,110.3 L173.1,107.1 L180.4,104.7 L176.3,100.9 L176.8,97.0 L179.3,93.6 L190.1,99.0 L195.6,99.3 L199.1,94.6 L206.9,98.1 L215.2,98.1 L216.0,94.6 L211.7,91.3 L213.1,85.6 L213.3,80.1 L207.8,77.0 L206.3,73.3 L206.0,69.3 L210.7,72.7 L215.6,72.1 L218.4,66.1 L219.7,59.4 L230.8,62.4 L239.2,69.8 L247.7,69.5 L248.5,57.8 L258.5,62.4 L262.4,71.9 L267.8,81.0 L279.3,84.7 L278.5,88.8 L273.0,96.2 L271.9,101.1 L272.3,110.1 L266.5,114.4 L256.5,117.5 L246.9,122.4 L242.2,123.7 L240.8,127.7 L245.4,131.3 L251.1,133.0 L254.1,138.2 L252.6,145.0 L253.2,150.7 L248.2,149.7 L244.1,149.9 L241.7,155.3 L231.7,162.7 L208.0,173.6 L209.4,177.8 L208.5,182.2 L198.7,179.0 L194.0,180.0 L189.6,182.1 L181.1,179.3 L172.7,173.8 L169.1,170.5 L168.6,165.6 L167.0,162.6 L156.2,157.0 Z" },
  { id: "DO.SR", name: "Santiago Rodríguez", capital: "Sabaneta", detail: "Cuna de la Restauración del país.", d: "M179.3,93.6 L176.8,97.0 L176.3,100.9 L180.4,104.7 L173.1,107.1 L166.2,110.3 L159.1,110.0 L156.2,111.9 L150.3,117.4 L147.6,121.0 L146.3,133.2 L146.9,137.4 L150.0,140.4 L150.2,146.5 L149.1,152.7 L139.0,152.5 L130.8,148.3 L114.1,139.4 L108.4,131.5 L100.6,126.4 L97.5,122.8 L95.6,118.5 L105.0,114.5 L107.4,101.8 L108.9,97.6 L108.6,93.1 L111.0,84.7 L115.6,77.5 L118.1,74.3 L121.3,76.8 L127.1,79.0 L133.2,78.6 L136.9,76.8 L141.0,76.3 L146.8,79.8 L152.8,80.5 L155.6,78.5 L158.9,79.7 L165.4,90.9 Z" },
  { id: "DO.VA", name: "Valverde", capital: "Mao", detail: "Ciudad de los bellos atardeceres y cultivo de arroz.", d: "M219.7,59.4 L218.4,66.1 L215.6,72.1 L210.7,72.7 L206.0,69.3 L206.3,73.3 L207.8,77.0 L213.3,80.1 L213.1,85.6 L211.7,91.3 L216.0,94.6 L215.2,98.1 L206.9,98.1 L199.1,94.6 L195.6,99.3 L190.1,99.0 L179.3,93.6 L165.4,90.9 L158.9,79.7 L161.1,72.9 L160.0,65.6 L161.3,61.3 L165.9,61.8 L165.0,48.6 L168.9,36.8 L175.3,39.2 L181.4,42.3 L185.6,45.5 L198.3,49.4 L204.6,54.6 L211.7,58.3 Z" },
  { id: "DO.JU", name: "San Juan", capital: "San Juan de la Maguana", detail: "Granero del Sur, Plaza Ceremonial Corral de los Indios.", d: "M149.1,152.7 L156.2,157.0 L167.0,162.6 L168.6,165.6 L169.1,170.5 L172.7,173.8 L181.1,179.3 L189.6,182.1 L194.0,180.0 L198.7,179.0 L208.5,182.2 L211.6,185.5 L213.1,189.8 L211.5,194.0 L207.5,196.0 L206.7,199.8 L199.3,205.5 L196.9,210.5 L195.6,220.4 L195.3,230.7 L193.8,234.1 L191.2,236.5 L188.4,235.4 L186.9,231.9 L180.7,233.8 L181.8,241.3 L179.5,246.5 L181.2,251.3 L174.4,254.1 L169.3,261.4 L160.9,263.6 L154.0,259.6 L145.0,262.2 L139.7,263.0 L134.5,262.4 L130.1,263.8 L125.9,266.4 L116.7,265.6 L108.2,261.1 L98.8,259.1 L89.9,255.7 L92.7,249.4 L90.6,243.7 L85.4,242.4 L82.0,238.6 L82.0,233.7 L80.7,229.1 L72.7,222.8 L75.1,213.1 L71.9,208.9 L73.6,198.1 L78.5,188.2 L82.7,184.5 L88.1,184.0 L94.0,182.4 L97.1,176.1 L99.4,167.6 L103.4,160.5 L109.8,161.6 L115.7,165.3 L122.9,165.0 L129.0,160.5 L129.4,154.3 L130.8,148.3 L139.0,152.5 Z" },
  { id: "DO.SD", name: "Santo Domingo", capital: "Santo Domingo Este", detail: "Rodea al Distrito Nacional, Parque Los Tres Ojos.", d: "M471.6,306.9 L461.8,300.1 L457.6,297.8 L454.8,297.5 L453.6,299.4 L454.0,303.9 L451.7,306.2 L445.5,305.0 L442.4,299.6 L439.4,297.6 L410.1,294.3 L404.8,294.5 L405.1,288.6 L399.8,287.8 L396.2,288.7 L392.6,288.4 L388.0,281.4 L382.9,284.2 L382.3,289.9 L386.5,296.1 L385.4,303.4 L383.0,304.1 L381.0,305.1 L380.2,299.6 L377.8,296.0 L369.2,295.9 L367.0,293.5 L366.5,290.1 L363.0,285.8 L358.3,282.3 L354.9,275.9 L352.9,268.8 L355.5,259.5 L350.4,251.2 L350.3,242.2 L355.6,244.2 L359.1,250.5 L371.4,254.5 L380.3,256.3 L388.4,252.6 L389.8,249.0 L394.5,248.1 L403.3,248.6 L408.4,252.7 L415.4,261.0 L416.4,265.0 L420.4,268.9 L421.9,274.5 L430.7,265.4 L441.8,261.4 L445.9,260.5 L449.5,258.2 L456.0,256.8 L462.8,259.4 L459.3,265.1 L461.4,264.7 L462.2,269.7 L461.9,274.7 L457.9,279.8 L454.9,285.0 L462.4,293.1 L473.6,295.3 Z" },
  { id: "DO.PM", name: "San Pedro de Macorís", capital: "San Pedro de Macorís", detail: "Cuna de peloteros y poetas, sabrosos pasteles en hoja.", d: "M556.1,310.0 L552.4,309.3 L544.0,306.5 L537.0,304.8 L531.4,300.1 L527.2,299.0 L519.8,301.1 L516.1,301.3 L512.2,299.0 L508.2,302.7 L483.5,304.5 L476.1,307.2 L471.6,306.9 L473.6,295.3 L462.4,293.1 L454.9,285.0 L457.9,279.8 L461.9,274.7 L462.2,269.7 L461.4,264.7 L459.3,265.1 L462.8,259.4 L473.7,240.5 L485.0,228.7 L485.0,235.6 L488.3,241.9 L490.7,258.3 L499.4,271.5 L504.9,284.7 L514.4,273.1 L517.5,265.7 L524.0,261.2 L529.1,264.6 L535.4,265.1 L540.0,270.2 L545.4,274.2 L551.4,273.3 L557.0,273.9 L554.6,283.7 L549.1,294.0 L552.6,298.6 L555.0,304.4 Z" },
  { id: "DO.MC", name: "Monte Cristi", capital: "San Fernando de Monte Cristi", detail: "El Morro de Monte Cristi, producción de sal marina.", d: "M168.9,36.8 L165.0,48.6 L165.9,61.8 L161.3,61.3 L160.0,65.6 L161.1,72.9 L158.9,79.7 L155.6,78.5 L152.8,80.5 L146.8,79.8 L141.0,76.3 L136.9,76.8 L133.2,78.6 L127.1,79.0 L121.3,76.8 L118.1,74.3 L115.6,77.5 L107.8,73.7 L100.7,68.8 L97.9,63.6 L93.2,62.2 L73.2,64.3 L55.0,56.3 L52.8,55.7 L53.1,52.5 L50.9,43.4 L57.9,46.1 L57.2,42.1 L54.0,34.4 L54.2,30.9 L49.1,30.5 L48.5,28.4 L53.7,22.1 L58.9,20.9 L62.2,17.4 L67.8,15.4 L70.0,13.4 L68.6,8.6 L72.0,6.5 L77.2,8.1 L79.9,5.4 L99.3,4.2 L104.2,4.9 L109.1,6.8 L127.0,16.4 L132.3,17.5 L137.3,15.6 L143.8,19.8 L152.5,20.1 L153.7,26.9 L157.4,32.7 Z" },
  { id: "DO.PP", name: "Puerto Plata", capital: "Puerto Plata", detail: "Loma Isabel de Torres, Teleférico, hermosas costas.", d: "M279.3,84.7 L267.8,81.0 L262.4,71.9 L258.5,62.4 L248.5,57.8 L247.7,69.5 L239.2,69.8 L230.8,62.4 L219.7,59.4 L211.7,58.3 L204.6,54.6 L198.3,49.4 L185.6,45.5 L181.4,42.3 L175.3,39.2 L168.9,36.8 L157.4,32.7 L153.7,26.9 L152.5,20.1 L154.4,19.6 L156.1,14.0 L158.3,13.1 L159.9,15.0 L161.9,20.3 L165.8,16.0 L163.3,13.4 L166.2,14.6 L174.3,13.5 L176.2,12.1 L179.8,5.5 L191.2,0.4 L194.5,0.0 L200.4,2.6 L202.0,5.1 L201.0,8.3 L206.0,9.8 L204.6,5.6 L213.8,7.2 L222.1,5.7 L226.5,7.4 L234.7,17.4 L234.4,21.1 L241.5,21.3 L244.2,22.6 L251.3,28.8 L258.2,32.3 L265.4,34.9 L273.8,36.3 L285.2,36.5 L289.5,33.0 L294.0,31.1 L301.3,33.5 L312.8,45.8 L310.7,51.4 L307.8,56.7 L294.5,58.9 L289.7,58.3 L286.7,60.9 L285.2,64.9 L283.6,75.5 Z" },
  { id: "DO.DA", name: "Dajabón", capital: "Dajabón", detail: "Frontera norte, Mercado Binacional dominico-haitiano.", d: "M115.6,77.5 L111.0,84.7 L108.6,93.1 L108.9,97.6 L107.4,101.8 L105.0,114.5 L95.6,118.5 L97.5,122.8 L100.6,126.4 L97.3,129.7 L93.4,132.0 L84.3,129.1 L81.9,131.8 L80.5,135.5 L72.6,139.1 L69.4,142.1 L57.2,135.9 L50.2,128.6 L46.9,123.8 L46.0,119.8 L54.3,114.4 L56.8,108.3 L60.1,102.6 L60.3,93.7 L58.3,78.1 L53.2,65.5 L52.4,60.9 L52.8,55.7 L55.0,56.3 L73.2,64.3 L93.2,62.2 L97.9,63.6 L100.7,68.8 L107.8,73.7 Z" },
  { id: "DO.ES", name: "Espaillat", capital: "Moca", detail: "Villa Heroica, productora de plátanos y café.", d: "M266.5,114.4 L272.3,110.1 L271.9,101.1 L273.0,96.2 L278.5,88.8 L279.3,84.7 L283.6,75.5 L285.2,64.9 L286.7,60.9 L289.7,58.3 L294.5,58.9 L307.8,56.7 L310.7,51.4 L312.8,45.8 L319.6,53.2 L326.2,57.2 L330.0,58.4 L338.7,59.4 L345.6,61.9 L358.3,64.5 L363.0,63.8 L365.3,61.7 L365.5,62.9 L361.9,73.2 L352.5,78.6 L344.0,78.5 L342.2,89.3 L340.2,88.9 L338.2,88.9 L333.9,81.9 L328.5,77.0 L322.8,80.2 L318.9,85.8 L314.4,88.8 L312.2,83.5 L305.6,80.6 L299.3,88.4 L299.2,101.7 L298.4,112.9 L294.2,124.6 L288.9,125.6 L285.1,116.0 L277.0,118.4 L271.0,117.8 Z" },
  { id: "DO.1857", name: "Hermanas Mirabal", capital: "Salcedo", detail: "Tierra de las mariposas (hermanas Mirabal).", d: "M294.2,124.6 L298.4,112.9 L299.2,101.7 L299.3,88.4 L305.6,80.6 L312.2,83.5 L314.4,88.8 L318.9,85.8 L322.8,80.2 L328.5,77.0 L333.9,81.9 L338.2,88.9 L335.5,100.4 L330.0,104.9 L322.0,108.7 L318.3,117.1 L316.7,126.5 L313.9,135.0 L313.7,143.5 L306.0,142.9 L300.7,137.7 L296.9,131.4 Z" },
  { id: "DO.BR", name: "Bahoruco", capital: "Neiba", detail: "Tierra de la uva, Sierra de Bahoruco.", d: "M89.9,255.7 L98.8,259.1 L108.2,261.1 L116.7,265.6 L125.9,266.4 L130.1,263.8 L134.5,262.4 L139.7,263.0 L145.0,262.2 L154.0,259.6 L160.9,263.6 L169.9,272.8 L181.7,277.0 L187.7,278.2 L192.7,281.6 L192.6,285.2 L188.6,286.6 L184.9,281.8 L179.2,291.9 L174.3,295.4 L168.4,297.5 L165.3,299.9 L163.1,303.2 L156.8,307.2 L153.4,312.4 L152.7,318.9 L145.9,319.3 L140.6,314.9 L135.8,305.6 L126.7,304.9 L119.3,307.6 L112.0,305.7 L105.1,301.3 L97.9,298.0 L78.4,290.0 L73.3,272.5 L75.5,268.4 L77.5,259.1 Z" },
  { id: "DO.BH", name: "Barahona", capital: "Barahona", detail: "La Perla del Sur, playas costeras de San Rafael.", d: "M197.4,334.7 L194.0,329.2 L190.0,326.8 L181.8,324.9 L177.9,324.8 L174.9,326.0 L171.6,333.6 L171.5,338.4 L175.0,343.3 L178.9,358.4 L175.2,364.0 L171.9,372.0 L153.5,398.1 L151.1,404.2 L145.4,407.4 L141.3,411.3 L138.7,417.0 L136.2,415.6 L136.2,407.3 L133.2,400.3 L127.5,400.0 L122.7,401.1 L113.3,393.2 L109.4,383.0 L110.7,381.2 L114.6,379.8 L116.1,374.1 L115.9,362.3 L110.0,358.8 L110.9,353.4 L114.5,349.7 L119.3,351.1 L123.7,350.6 L118.2,328.1 L126.6,326.4 L136.2,329.8 L146.3,327.2 L152.7,318.9 L153.4,312.4 L156.8,307.2 L163.1,303.2 L165.3,299.9 L168.4,297.5 L174.3,295.4 L179.2,291.9 L184.9,281.8 L188.6,286.6 L190.5,289.9 L191.0,296.3 L187.1,301.2 L181.2,306.2 L183.0,310.8 L187.1,313.1 L198.8,316.3 L198.3,319.2 L200.3,329.9 Z" },
  { id: "DO.IN", name: "Independencia", capital: "Jimaní", detail: "Lago Enriquillo, cocodrilos e iguanas.", d: "M89.9,255.7 L77.5,259.1 L75.5,268.4 L73.3,272.5 L78.4,290.0 L97.9,298.0 L105.1,301.3 L112.0,305.7 L119.3,307.6 L126.7,304.9 L135.8,305.6 L140.6,314.9 L145.9,319.3 L152.7,318.9 L146.3,327.2 L136.2,329.8 L126.6,326.4 L118.2,328.1 L123.7,350.6 L119.3,351.1 L114.5,349.7 L110.9,353.4 L110.0,358.8 L99.0,348.8 L85.5,344.2 L69.3,335.9 L53.2,326.6 L55.7,322.6 L50.8,318.6 L40.6,314.6 L33.5,309.7 L27.6,302.1 L20.2,300.2 L17.3,298.6 L16.3,294.8 L19.5,290.8 L17.6,285.6 L10.8,278.4 L6.1,269.9 L1.7,266.8 L0.0,264.1 L2.6,262.3 L9.7,260.9 L24.0,263.8 L31.4,261.4 L33.9,258.7 L37.9,252.1 L42.4,248.2 L52.9,249.6 L65.8,251.8 L78.0,252.9 Z" },
  { id: "DO.EP", name: "Elías Piña", capital: "Comendador", detail: "Frontera montañosa, ricas tradiciones.", d: "M130.8,148.3 L129.4,154.3 L129.0,160.5 L122.9,165.0 L115.7,165.3 L109.8,161.6 L103.4,160.5 L99.4,167.6 L97.1,176.1 L94.0,182.4 L88.1,184.0 L82.7,184.5 L78.5,188.2 L73.6,198.1 L71.9,208.9 L75.1,213.1 L72.7,222.8 L80.7,229.1 L82.0,233.7 L82.0,238.6 L85.4,242.4 L90.6,243.7 L92.7,249.4 L89.9,255.7 L78.0,252.9 L65.8,251.8 L52.9,249.6 L42.4,248.2 L50.3,243.0 L52.6,239.3 L54.9,232.3 L55.3,228.5 L53.9,220.6 L53.8,212.5 L52.8,208.8 L45.4,200.9 L42.8,195.2 L41.1,193.8 L36.6,193.5 L28.5,195.6 L28.0,192.1 L31.3,189.9 L41.1,187.5 L43.6,186.0 L52.0,177.0 L57.8,169.1 L67.2,162.1 L69.7,158.6 L70.7,155.2 L71.7,143.3 L69.4,142.1 L72.6,139.1 L80.5,135.5 L81.9,131.8 L84.3,129.1 L93.4,132.0 L97.3,129.7 L100.6,126.4 L108.4,131.5 L114.1,139.4 Z" },
  { id: "DO.AZ", name: "Azua", capital: "Azua de Compostela", detail: "Playa Monte Río, Batalla del 19 de Marzo.", d: "M271.1,333.4 L268.6,331.8 L268.3,328.0 L271.7,325.0 L272.7,321.0 L272.3,313.1 L267.1,305.4 L264.6,303.6 L256.5,301.0 L251.7,300.6 L247.7,301.6 L245.9,305.1 L246.0,310.9 L240.3,316.5 L236.7,318.0 L228.7,316.4 L224.6,318.8 L220.4,318.9 L217.1,321.9 L215.1,326.0 L211.6,327.3 L206.5,333.3 L203.7,334.8 L197.4,334.7 L200.3,329.9 L198.3,319.2 L198.8,316.3 L187.1,313.1 L183.0,310.8 L181.2,306.2 L187.1,301.2 L191.0,296.3 L190.5,289.9 L188.6,286.6 L192.6,285.2 L192.7,281.6 L187.7,278.2 L181.7,277.0 L169.9,272.8 L160.9,263.6 L169.3,261.4 L174.4,254.1 L181.2,251.3 L179.5,246.5 L181.8,241.3 L180.7,233.8 L186.9,231.9 L188.4,235.4 L191.2,236.5 L193.8,234.1 L195.3,230.7 L195.6,220.4 L196.9,210.5 L199.3,205.5 L206.7,199.8 L207.5,196.0 L211.5,194.0 L213.1,189.8 L223.0,196.7 L225.0,215.1 L233.0,226.2 L244.5,232.2 L251.7,241.0 L248.9,252.4 L254.2,263.2 L258.1,273.3 L260.9,275.1 L262.3,278.0 L265.6,281.2 L270.0,282.8 L276.3,287.0 L282.4,290.2 L290.5,305.4 L291.7,309.0 L289.8,312.7 L288.7,323.7 L281.7,331.5 Z" },
  { id: "DO.VE", name: "La Vega", capital: "La Vega", detail: "Cuna del Carnaval, fértiles valles de Jarabacoa y Constanza.", d: "M294.2,124.6 L296.9,131.4 L300.7,137.7 L306.0,142.9 L313.7,143.5 L319.8,153.0 L329.2,159.3 L329.9,160.4 L325.7,161.9 L313.4,167.8 L308.0,173.9 L306.6,168.7 L302.1,166.0 L298.4,167.3 L296.3,171.0 L287.2,173.4 L283.2,180.7 L282.9,194.3 L271.5,203.5 L269.7,217.3 L280.7,230.5 L277.9,239.3 L272.9,245.6 L265.9,252.4 L248.9,252.4 L251.7,241.0 L244.5,232.2 L233.0,226.2 L225.0,215.1 L223.0,196.7 L213.1,189.8 L211.6,185.5 L208.5,182.2 L209.4,177.8 L208.0,173.6 L231.7,162.7 L241.7,155.3 L244.1,149.9 L248.2,149.7 L253.2,150.7 L252.6,145.0 L254.1,138.2 L251.1,133.0 L245.4,131.3 L240.8,127.7 L242.2,123.7 L246.9,122.4 L256.5,117.5 L266.5,114.4 L271.0,117.8 L277.0,118.4 L285.1,116.0 L288.9,125.6 Z" },
  { id: "DO.SZ", name: "Sánchez Ramírez", capital: "Cotuí", detail: "Presa de Hatillo, producción de piñas y oro.", d: "M308.0,173.9 L313.4,167.8 L325.7,161.9 L329.9,160.4 L329.2,159.3 L332.0,157.5 L339.7,159.3 L343.6,158.6 L352.0,158.5 L365.7,160.0 L374.8,164.2 L379.3,165.7 L391.3,166.2 L396.0,167.7 L400.0,170.3 L399.3,175.6 L397.6,181.1 L394.7,193.9 L391.3,206.9 L386.0,211.0 L379.8,207.9 L376.0,207.2 L373.7,210.7 L366.3,209.3 L361.3,210.5 L357.6,213.7 L339.7,217.6 L334.8,209.0 L322.7,200.2 L319.8,196.2 L317.5,191.1 L312.7,188.7 L311.8,183.3 Z" },
  { id: "DO.MN", name: "Monseñor Nouel", capital: "Bonao", detail: "Tierra de las hortensias y Carnaval de Bonao.", d: "M308.0,173.9 L311.8,183.3 L312.7,188.7 L317.5,191.1 L319.8,196.2 L322.7,200.2 L334.8,209.0 L339.7,217.6 L335.8,221.9 L334.4,228.1 L327.9,231.2 L325.2,236.9 L322.5,244.5 L315.5,244.3 L310.7,240.9 L305.6,238.8 L301.0,240.4 L296.2,240.8 L288.6,235.2 L280.7,230.5 L269.7,217.3 L271.5,203.5 L282.9,194.3 L283.2,180.7 L287.2,173.4 L296.3,171.0 L298.4,167.3 L302.1,166.0 L306.6,168.7 Z" }
];

const StarBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[100]">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.5, 2.5],
            x: Math.cos((i * 36 * Math.PI) / 180) * 180,
            y: Math.sin((i * 36 * Math.PI) / 180) * 180,
            rotate: 180
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute"
        >
          <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-md" />
        </motion.div>
      ))}
    </div>
  );
};

type GameMode = 'challenge' | 'practice' | 'explorer';

export default function MapaDominicano() {
  const context = useOutletContext<{ isSidebarPinned: boolean } | null>();
  const isSidebarPinned = context?.isSidebarPinned ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const user = getCurrentUser();
  const isPremium = user?.rol === 'admin' || user?.suscripcion === 'pro';

  // Fullscreen detector
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Game States
  const [mode, setMode] = useState<GameMode>('challenge');
  const [phase, setPhase] = useState<'welcome' | 'playing' | 'completed'>('welcome');
  const [remainingProvinces, setRemainingProvinces] = useState<Provincia[]>([]);
  const [completedProvinces, setCompletedProvinces] = useState<string[]>([]);
  const [targetProvince, setTargetProvince] = useState<Provincia | null>(null);
  
  // Tómbola (Raffle Drum) States
  const [isRolling, setIsRolling] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [showStars, setShowStars] = useState(false);

  // Interactive / Feedback States
  const [hoveredProvince, setHoveredProvince] = useState<Provincia | null>(null);
  const [wrongProvinceClicked, setWrongProvinceClicked] = useState<Provincia | null>(null);
  const [showCheatLabels, setShowCheatLabels] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({
    text: '',
    type: null
  });

  // Score / Stats
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer loop when playing
  useEffect(() => {
    let interval: any;
    if (phase === 'playing' && mode !== 'explorer') {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase, startTime, mode]);

  // Format Elapsed Time (e.g. 02:05)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const actualSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${actualSecs.toString().padStart(2, '0')}`;
  };

  // Run the Tómbola draw animation
  const runTombolaDraw = (nextTarget: Provincia, remainingList: Provincia[]) => {
    setIsRolling(true);
    setWrongProvinceClicked(null);
    setTargetProvince(null); // Hide active target during roll
    setFeedbackMsg({ text: '🎰 Girando la tómbola de provincias...', type: 'info' });

    let tickCount = 0;
    const maxTicks = 18; // Number of cycles
    
    const interval = setInterval(() => {
      // Pick a random province name to show in the roll
      const randomIdx = Math.floor(Math.random() * PROVINCIAS.length);
      setRollingName(PROVINCIAS[randomIdx].name);
      playSynthSound('tick');
      
      tickCount++;
      if (tickCount >= maxTicks) {
        clearInterval(interval);
        
        // Final draw
        setIsRolling(false);
        setTargetProvince(nextTarget);
        setRemainingProvinces(remainingList);
        playSynthSound('pop');
        setFeedbackMsg({ text: '📍 Tómbola completada. ¡Ubica la provincia indicada!', type: 'info' });
      }
    }, 90);
  };

  // Start / Restart Game
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setCompletedProvinces([]);
    setErrorsCount(0);
    setTotalAttempts(0);
    setStreak(0);
    setMaxStreak(0);
    setElapsedTime(0);
    setWrongProvinceClicked(null);
    setHoveredProvince(null);

    // Auto trigger fullscreen mode
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    }

    if (selectedMode === 'explorer') {
      setPhase('playing');
      setTargetProvince(null);
      setRemainingProvinces([]);
      setFeedbackMsg({ text: '📍 Modo Explorador: Haz clic en cualquier provincia para ver su información.', type: 'info' });
    } else {
      // Shuffle provinces
      const shuffled = [...PROVINCIAS].sort(() => Math.random() - 0.5);
      const firstTarget = shuffled[0];
      setStartTime(Date.now());
      setPhase('playing');
      
      // Trigger tómbola roll for the first target
      runTombolaDraw(firstTarget, shuffled.slice(1));
    }
  };

  // Handle clicking a province path
  const handleProvinceClick = (prov: Provincia) => {
    if (isRolling) return; // Prevent clicking while rolling

    setWrongProvinceClicked(null);
    setTotalAttempts(prev => prev + 1);

    if (mode === 'explorer') {
      playSynthSound('correct');
      setHoveredProvince(prov);
      setFeedbackMsg({ 
        text: `📍 ${prov.name.toUpperCase()} (Capital: ${prov.capital}) — ${prov.detail}`, 
        type: 'info' 
      });
      if (!completedProvinces.includes(prov.id)) {
        setCompletedProvinces(prev => [...prev, prov.id]);
      }
      return;
    }

    if (!targetProvince) return;

    // Check correctness
    if (prov.id === targetProvince.id) {
      // CORRECT!
      playSynthSound('correct');
      const updatedCompleted = [...completedProvinces, targetProvince.id];
      setCompletedProvinces(updatedCompleted);
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }

      setFeedbackMsg({ 
        text: `✅ ¡Excelente! Has ubicado correctamente a ${targetProvince.name}.`, 
        type: 'success' 
      });
      setShowStars(true);

      // Delay to show stars before moving to the next target
      setTimeout(() => {
        setShowStars(false);
        // Select next target or finish
        if (remainingProvinces.length > 0) {
          const nextTarget = remainingProvinces[0];
          runTombolaDraw(nextTarget, remainingProvinces.slice(1));
        } else {
          // Game Completed!
          playSynthSound('complete');
          setPhase('completed');
        }
      }, 1500);

    } else {
      // INCORRECT
      playSynthSound('incorrect');
      setStreak(0);
      setErrorsCount(prev => prev + 1);
      setWrongProvinceClicked(prov);
      
      setFeedbackMsg({ 
        text: `❌ Inténtalo otra vez, ¡tú puedes!`, 
        type: 'error' 
      });
    }
  };

  // Accuracy calculation
  const accuracy = totalAttempts > 0 
    ? Math.round((completedProvinces.length / totalAttempts) * 100) 
    : 100;

  return (
    <div ref={containerRef} className="w-full plx-fullscreen-bg flex flex-col items-stretch">
      <style>{`
        .plx-fullscreen-bg:fullscreen {
          background-color: #FBF9F6 !important;
          padding: 2rem !important;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        .dark .plx-fullscreen-bg:fullscreen {
          background-color: #0b0b0e !important;
        }
      `}</style>

      {/* Header Controls */}
      <header className="flex items-center justify-between px-6 py-4 w-full max-w-4xl mx-auto bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs mb-6 mt-4 select-none gap-4">
        <div className="flex-1 flex justify-start">
          {phase === 'welcome' ? (
            <Link 
              to="/dinamicas" 
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              ← VOLVER A DINÁMICAS
            </Link>
          ) : (
            <button
              onClick={() => {
                setPhase('welcome');
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              ← VOLVER A CONFIGURAR
            </button>
          )}
        </div>

        <div className="flex-none flex items-center justify-center">
          {isPremium ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-600/12 dark:from-amber-500/20 dark:to-amber-600/20 border border-amber-500/25 dark:border-amber-500/40 rounded-full shadow-[0_2px_12px_rgba(245,158,11,0.08)]">
              <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 fill-amber-500/20 stroke-[2.5]" />
              <span className="text-xs md:text-[13px] font-black text-amber-850 dark:text-amber-400 tracking-tight">
                Planix Pro
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/10 rounded-xl px-3 py-1.5 shadow-2xs select-none">
              <img 
                src="/creditos.webp" 
                alt="Créditos" 
                className="w-7 h-7 object-contain shrink-0" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xs md:text-sm font-black text-slate-800 dark:text-zinc-200">
                {getUserCredits(user)} PC
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex justify-end gap-3 items-center">
          {phase !== 'welcome' && (
            <button
              onClick={() => {
                startGame(mode);
              }}
              className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-350 font-black text-xs rounded-full border border-black/10 dark:border-white/10 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw size={12} className="shrink-0" />
              <span>Reiniciar</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-xs font-black text-white bg-brand-primary hover:bg-brand-primary/90 px-5 py-2.5 rounded-full transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
          >
            {isFullscreen ? '⤢ SALIR PANTALLA COMPLETA' : '⤢ PANTALLA COMPLETA'}
          </button>
        </div>
      </header>

      {/* Styled Banner matching Jeopardy header style */}
      {!isFullscreen && (
        <div className="print:hidden mb-5 bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-sky-600/10 dark:from-sky-500/15 dark:to-blue-600/15 border border-sky-500/15 dark:border-sky-500/25 rounded-xl py-3 px-5 flex flex-col md:flex-row items-center gap-3.5 shadow-2xs relative overflow-hidden w-full max-w-4xl mx-auto select-none">
          {/* Background decorations */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-sky-500/10 dark:bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Icon container */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-sky-500/20 dark:bg-sky-500/30 flex items-center justify-center shrink-0 border border-sky-500/30 dark:border-sky-500/40 relative">
            <MapPin className="w-5 h-5 md:w-6 h-6 text-sky-600 dark:text-sky-400 stroke-[2.5]" />
          </div>

          {/* Texts */}
          <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
              Challenge Mapa Dominicano
            </h1>
            <p className="text-slate-655 dark:text-zinc-400 font-medium text-[11px] md:text-xs mt-0.5 max-w-3xl leading-normal">
              Coloca a prueba a tus alumnos proyectando el mapa. Al girar la tómbola saldrá una provincia de manera aleatoria y el niño deberá señalar correctamente cuál es en el mapa.
            </p>
          </div>
        </div>
      )}

      <main className={`flex-1 flex flex-col pt-2 w-full min-w-0 pb-10 px-6 ${
        isSidebarPinned ? 'md:px-6 xl:px-8' : 'md:px-[60px] xl:px-16'
      } text-text-main dark:text-white transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">

      <AnimatePresence mode="wait">
        {/* Welcome / Mode Config Screen */}
        {phase === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xs dark:shadow-none mt-6"
          >
            {/* Config & Controls */}
            <div className="space-y-8">


              {/* Mode Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 tracking-wider block text-center">Elige tu Modo de Juego</label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Desafío Evaluado */}
                  <button 
                    onClick={() => startGame('challenge')}
                    className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 border border-black/5 dark:border-white/10 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-500/30 dark:hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer h-full relative overflow-hidden"
                  >
                    {/* Top Accent Gradient Border */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Trophy className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between items-center w-full">
                      <div className="flex flex-col items-center">
                        <h4 className="font-extrabold text-slate-800 dark:text-zinc-100 text-[16px] tracking-tight transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                          Modo Desafío
                        </h4>
                        <span className="mt-2 text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Reto</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                          Saca las provincias de la tómbola. El mapa se queda en blanco. Ideal para evaluar el conocimiento escolar.
                        </p>
                      </div>
                      
                      <div className="w-10 h-1 bg-sky-500 rounded-full mt-5 opacity-20 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
                    </div>
                  </button>

                  {/* Modo Práctica */}
                  <button 
                    onClick={() => startGame('practice')}
                    className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 border border-black/5 dark:border-white/10 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 dark:hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer h-full relative overflow-hidden"
                  >
                    {/* Top Accent Gradient Border */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between items-center w-full">
                      <div className="flex flex-col items-center">
                        <h4 className="font-extrabold text-slate-800 dark:text-zinc-100 text-[16px] tracking-tight transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          Modo Práctica
                        </h4>
                        <span className="mt-2 text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Fácil</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                          El nombre sale de la tómbola, pero los alumnos pueden ver los nombres en el mapa al colocar el cursor encima de las provincias.
                        </p>
                      </div>
                      
                      <div className="w-10 h-1 bg-purple-500 rounded-full mt-5 opacity-20 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
                    </div>
                  </button>

                  {/* Modo Explorador */}
                  <button 
                    onClick={() => startGame('explorer')}
                    className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 border border-black/5 dark:border-white/10 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1.5 group cursor-pointer h-full relative overflow-hidden"
                  >
                    {/* Top Accent Gradient Border */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Compass className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between items-center w-full">
                      <div className="flex flex-col items-center">
                        <h4 className="font-extrabold text-slate-800 dark:text-zinc-100 text-[16px] tracking-tight transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          Explorador Libre
                        </h4>
                        <span className="mt-2 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Estudio</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                          Sin tómbola ni turnos. Haz clic libremente en el mapa para estudiar y conocer capitales y datos de cada provincia.
                        </p>
                      </div>
                      
                      <div className="w-10 h-1 bg-emerald-500 rounded-full mt-5 opacity-20 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Playing Screen */}
        {phase === 'playing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT COLUMN: Controls & Game Stats */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* TÓMBOLA DRAW CONTAINER */}
              {mode !== 'explorer' && (
                <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100/30 dark:bg-sky-950/10 rounded-full translate-x-8 -translate-y-8 -z-10" />
                  
                  {/* Minimalist Radar Target Graphic */}
                  <div className="mb-4">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 text-sky-500 dark:text-sky-400">
                      {/* Outer animated ring */}
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" strokeDasharray="6,4" fill="none" className={isRolling ? "animate-spin" : ""} style={{ transformOrigin: '50px 50px', animationDuration: '6s' }} />
                      {/* Inner pulsing circle */}
                      <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" fill="none" className={isRolling ? "animate-pulse" : ""} />
                      {/* Center target dot */}
                      <circle cx="50" cy="50" r="6" fill="currentColor" />
                      {/* Crosshairs */}
                      <line x1="50" y1="5" x2="50" y2="25" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="50" y1="75" x2="50" y2="95" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="5" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="1.5" />
                      <line x1="75" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>

                  <span className="text-xs md:text-sm font-black uppercase text-sky-600 dark:text-sky-400 tracking-widest mb-3">
                    {isRolling ? 'SELECCIONANDO PROVINCIA...' : 'PROVINCIA SELECCIONADA'}
                  </span>

                  <AnimatePresence mode="wait">
                    {isRolling ? (
                      <motion.div
                        key="rolling"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-base font-bold text-slate-400 tracking-wide uppercase px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50 min-h-[46px] flex items-center justify-center w-full"
                      >
                        {rollingName}
                      </motion.div>
                    ) : (
                      targetProvince && (
                        <motion.div
                          key="drawn"
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="flex flex-col items-center w-full"
                        >
                          <div className="bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 text-white rounded-2xl p-4 shadow-md w-full border border-sky-400 dark:border-sky-800">
                            <span className="text-[10px] font-black uppercase text-amber-300 dark:text-yellow-300 tracking-wider block mb-1.5">DEBES LOCALIZAR</span>
                            <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase leading-tight drop-shadow-xs">
                              {targetProvince.name}
                            </h2>
                          </div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>

                  <p className="text-[11px] text-slate-400 mt-4 font-semibold italic">
                    {isRolling ? 'Espera que el sorteo se detenga...' : 'El estudiante debe señalar esta provincia en el mapa.'}
                  </p>
                </div>
              )}

              {/* EXPLORER DISPLAY CARD */}
              {mode === 'explorer' && (
                <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xs flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 dark:bg-emerald-950/40 rounded-full translate-x-8 -translate-y-8 -z-10" />
                  
                  <span className="text-xs font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5 mb-2">
                    <Compass className="w-4 h-4 animate-spin" />
                    MODO EXPLORADOR LIBRE
                  </span>

                  {hoveredProvince ? (
                    <div className="space-y-3">
                      <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase">
                        {hoveredProvince.name}
                      </h2>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-500 dark:text-slate-400">
                          <strong className="text-slate-700 dark:text-slate-300">Capital:</strong> {hoveredProvince.capital}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                          <strong className="text-slate-700 dark:text-slate-300">Detalle:</strong> {hoveredProvince.detail}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HelpCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Haz clic en cualquier provincia
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Presiona los límites territoriales para conocer los nombres de las provincias, sus cabeceras municipales y datos históricos.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* LIVE STATS PANEL */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Estadísticas en vivo
                </h3>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Progreso del mapa</span>
                    <span className="text-slate-800 dark:text-white">
                      {completedProvinces.length} / 32 ({Math.round((completedProvinces.length / 32) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-400 to-emerald-500 transition-all duration-300 rounded-full"
                      style={{ width: `${(completedProvinces.length / 32) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Accuracy */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Precisión</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">{accuracy}%</span>
                  </div>

                  {/* Errors */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Errores</span>
                    <span className="text-lg font-black text-red-500 dark:text-red-400">{errorsCount}</span>
                  </div>

                  {/* Current Streak */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Racha Actual</span>
                    <span className="text-lg font-black text-orange-500 dark:text-orange-400 flex items-center gap-1">
                      <Zap className="w-4 h-4 fill-orange-500 text-orange-500" />
                      {streak}
                    </span>
                  </div>

                  {/* Elapsed Time */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tiempo</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                </div>

                {/* Cheat Sheet Toggle */}
                {(mode === 'challenge' || mode === 'practice') && (
                  <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Mostrar nombres de provincias</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={showCheatLabels}
                        onChange={(e) => setShowCheatLabels(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>
                )}
              </div>

              {/* ALERTS / FEEDBACK PANEL */}
              {feedbackMsg.text && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all duration-300 ${
                  feedbackMsg.type === 'success' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                    : feedbackMsg.type === 'error'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-300'
                      : 'bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/30 text-sky-800 dark:text-sky-300'
                }`}>
                  {feedbackMsg.type === 'success' && <Check className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />}
                  {feedbackMsg.type === 'error' && <X className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />}
                  {feedbackMsg.type === 'info' && <Smile className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />}
                  <span className="text-xs font-semibold leading-relaxed">{feedbackMsg.text}</span>
                </div>
              )}

              {/* LIST OF PROVINCES */}
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-3xl p-6 shadow-xs max-h-[250px] overflow-y-auto">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Provincias de la R.D.</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PROVINCIAS.map(p => {
                    const isCompleted = completedProvinces.includes(p.id);
                    const isTarget = targetProvince?.id === p.id;
                    return (
                      <div 
                        key={p.id}
                        className={`flex items-center gap-1.5 p-1 rounded-sm ${
                          isTarget 
                            ? 'font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/30 animate-pulse' 
                            : isCompleted 
                              ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-75 font-semibold' 
                              : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isTarget ? 'bg-sky-500 animate-ping' : isCompleted ? 'bg-emerald-500' : 'bg-slate-350 dark:bg-slate-700'
                        }`} />
                        <span className="truncate">{p.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Map */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-[32px] p-6 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center relative">
              
              {mode !== 'challenge' && hoveredProvince && (
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-black/5 dark:border-white/5 text-[11px] font-bold text-sky-600 dark:text-sky-400 shadow-2xs pointer-events-none z-20">
                  🔍 Apuntando: {hoveredProvince.name}
                </div>
              )}

              {/* MAP SCROLL/PAN BOX */}
              <div className="w-full relative overflow-hidden flex items-center justify-center bg-sky-100/50 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-950/30 p-4 select-none transition-colors duration-200">
                
                <AnimatePresence>
                  {showStars && <StarBurst />}
                </AnimatePresence>

                {/* SVG MAP ELEMENT */}
                <svg 
                  viewBox="0 0 710 500" 
                  className="w-full h-auto max-h-[550px]"
                  style={{ filter: "drop-shadow(0px 8px 16px rgba(0, 0, 0, 0.05))" }}
                >
                  {/* Centered country name at the bottom of the map ocean */}
                  <text x="355" y="430" textAnchor="middle" className="fill-sky-500/60 dark:fill-sky-400/40 text-base md:text-lg font-black tracking-[0.25em] uppercase select-none pointer-events-none">
                    República Dominicana
                  </text>

                  {/* Grid Lines representing Lat/Long */}
                  <g stroke="currentColor" className="text-sky-300/40 dark:text-sky-900/15" strokeWidth="1" strokeDasharray="3,3" fill="none">
                    <line x1="0" y1="100" x2="710" y2="100" />
                    <line x1="0" y1="200" x2="710" y2="200" />
                    <line x1="0" y1="300" x2="710" y2="300" />
                    <line x1="0" y1="400" x2="710" y2="400" />
                    
                    <line x1="100" y1="0" x2="100" y2="500" />
                    <line x1="200" y1="0" x2="200" y2="500" />
                    <line x1="300" y1="0" x2="300" y2="500" />
                    <line x1="400" y1="0" x2="400" y2="500" />
                    <line x1="500" y1="0" x2="500" y2="500" />
                    <line x1="600" y1="0" x2="600" y2="500" />
                  </g>

                  {/* Wave Lines */}
                  <g stroke="currentColor" className="text-sky-300/60 dark:text-sky-850/15" strokeWidth="1.5" fill="none" strokeLinecap="round">
                    {/* Bottom left sea */}
                    <path d="M 120 440 Q 130 435 140 440 T 160 440" />
                    <path d="M 130 452 Q 140 447 150 452 T 170 452" />
                    
                    {/* Bottom center sea */}
                    <path d="M 350 450 Q 360 445 370 450 T 390 450" />
                    
                    {/* Top right sea */}
                    <path d="M 580 80 Q 590 75 600 80 T 620 80" />
                    <path d="M 590 92 Q 600 87 610 92 T 630 92" />
                  </g>

                  {/* Compass Rose */}
                  <g transform="translate(80, 400)" opacity="0.45" className="text-sky-400 dark:text-sky-800">
                    <circle cx="0" cy="0" r="30" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2,2" />
                    <circle cx="0" cy="0" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    
                    {/* Points */}
                    <path d="M 0 0 L 0 -25 L 3 -5 Z" fill="currentColor" />
                    <path d="M 0 0 L 0 -25 L -3 -5 Z" fill="rgba(255,255,255,0.4)" />
                    
                    <path d="M 0 0 L 0 25 L -3 5 Z" fill="currentColor" />
                    <path d="M 0 0 L 0 25 L 3 5 Z" fill="rgba(255,255,255,0.4)" />

                    <path d="M 0 0 L 25 0 L 5 3 Z" fill="currentColor" />
                    <path d="M 0 0 L 25 0 L 5 -3 Z" fill="rgba(255,255,255,0.4)" />

                    <path d="M 0 0 L -25 0 L -5 -3 Z" fill="currentColor" />
                    <path d="M 0 0 L -25 0 L -5 3 Z" fill="rgba(255,255,255,0.4)" />
                    
                    <text x="-4" y="-33" fontSize="9" fontWeight="bold" fill="currentColor">N</text>
                  </g>

                  <g id="admin1">
                    {PROVINCIAS.map((prov) => {
                      const isCompleted = completedProvinces.includes(prov.id);
                      const isTarget = targetProvince?.id === prov.id;
                      const isFlashingWrong = wrongProvinceClicked?.id === prov.id;

                      // Fill color logic
                      let fill = '#FFFFFF'; // Default light mode
                      let stroke = '#64748B'; // Default border light mode
                      
                      // Dark mode defaults
                      if (document.documentElement.classList.contains('dark')) {
                        fill = '#0F172A';
                        stroke = '#334155';
                      }

                      if (isCompleted) {
                        fill = '#10B981'; // Green
                        stroke = '#047857';
                      } else if (isFlashingWrong) {
                        fill = '#EF4444'; // Red flash
                        stroke = '#B91C1C';
                      } else if (isTarget && showCheatLabels) {
                        fill = '#BAE6FD'; // Light blue highlight
                        stroke = '#0284C7';
                      }

                      // Stroke width logic
                      const strokeWidth = isFlashingWrong ? "1.5" : "0.5";

                      return (
                        <path
                          key={prov.id}
                          d={prov.d}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                          className={`transition-colors duration-250 cursor-pointer hover:opacity-90 ${isRolling ? 'pointer-events-none opacity-50' : ''}`}
                          style={{
                            transformOrigin: 'center',
                          }}
                          onClick={() => handleProvinceClick(prov)}
                          onMouseEnter={() => {
                            setHoveredProvince(prov);
                            if (mode === 'practice') {
                              setFeedbackMsg({ text: `💡 Esa es la provincia: ${prov.name} (Capital: ${prov.capital})`, type: 'info' });
                            }
                          }}
                          onMouseLeave={() => {
                            setHoveredProvince(null);
                          }}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Floating Tooltip inside Map Container (Study Mode Hover) */}
                {(mode === 'practice' || showCheatLabels) && hoveredProvince && (
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md backdrop-blur-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse" />
                    <strong>{hoveredProvince.name}</strong> ({hoveredProvince.capital})
                  </div>
                )}
              </div>

              {/* Map Footer Help */}
              <div className="w-full text-center mt-4">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-sky-500" />
                  Haz clic directo en el mapa para posicionar cada provincia
                </p>
              </div>

            </div>

          </motion.div>
        )}

        {/* Completed Celebration Screen */}
        {phase === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-xl mx-auto w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-[32px] p-8 md:p-12 shadow-lg dark:shadow-none text-center space-y-6 mt-10"
          >
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-12 h-12 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                ¡Reto Superado!
              </span>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mt-3">
                ¡Mapa Dominicano Completado!
              </h2>
              <p className="text-sm text-text-muted dark:text-slate-400 mt-2 max-w-sm mx-auto">
                Has ubicado correctamente las 32 provincias de la República Dominicana en el mapa nacional sacándolas de la tómbola.
              </p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Precisión</span>
                <span className="text-xl font-extrabold text-emerald-500 dark:text-emerald-400">{accuracy}%</span>
              </div>
              
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Errores</span>
                <span className="text-xl font-extrabold text-red-500 dark:text-red-400">{errorsCount}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tiempo Total</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">
                  {formatTime(elapsedTime)}
                </span>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="flex items-center justify-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
              <Award className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                {accuracy === 100 
                  ? '🏅 Calificación: ¡PERFECTO! 100% de precisión.' 
                  : accuracy >= 85
                    ? '🥈 Calificación: ¡Excelente trabajo!'
                    : '🥉 Calificación: Buen intento. ¡Sigue practicando!'}
              </span>
            </div>

            {/* Restart Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={() => startGame(mode)} 
                className="flex-1 px-6 py-3.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-slate-700 dark:hover:bg-slate-100 font-bold transition text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Jugar de Nuevo
              </button>

              <button 
                onClick={() => setPhase('welcome')} 
                className="flex-1 px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 font-bold transition text-sm text-slate-650 dark:text-slate-350 cursor-pointer"
              >
                Cambiar de Modo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </main>
    </div>
  );
}
