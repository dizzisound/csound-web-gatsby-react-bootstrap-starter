export default class Util {

    constructor() {
      this.sintable = new Array(65536);
      for (let i = 0; i < 65536; i++)
      {   
        this.sintable[i] = Math.sin(2*Math.PI * i/65536.0);
      }   
      this.od2p = 1/(2*Math.PI);
      this.mpih = Math.PI/2;
    }

    sin(fphs) {
      let sign = fphs>=0?1:-1;
      let phs = Math.floor(fphs*this.od2p*65536);
      return sign*this.sintable[(sign*phs)&0xFFFF];
    }
    
    cos(fphs) {
      return this.sin(this.mpih-fphs);
    }

    static randomInt() {
       return this.randomIntM(4294967296); 
    }
    static randomIntM(max) {
       return Math.floor(Math.random() * max); 
    }

    // Resolve a CSS colour such as "var(--cs-blue)" to a value a canvas accepts
    // (canvas and Konva can't use CSS variables). Other colours pass through.
    static cssColor(color, el) {
      const m = /^var\((--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(color || "");
      if (!m || typeof window === "undefined") return color;
      const value = getComputedStyle(el || document.documentElement).getPropertyValue(m[1]).trim();
      return value || m[2] || color;
    }

    // Number of decimals implied by a step, e.g. 1 -> 0, 0.25 -> 2, 1e-7 -> 7.
    static decimalsOf(step) {
      const [mantissa, exp] = String(step).toLowerCase().split("e");
      const dot = mantissa.indexOf(".");
      const decimals = (dot < 0 ? 0 : mantissa.length - dot - 1) - Number(exp || 0);
      return Math.max(0, decimals);
    }
}
