import{o as f,t as g,r as w,w as y}from"./Fx.astro_astro_type_script_index_0_lang.CGbv7hfv.js";import{R as h,P as b,V as s,a as C,M as A,T as z}from"./Triangle.B0wQzpv-.js";const q=`
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`,T=`
  precision highp float;
  uniform float uTime;
  uniform vec2 uAspect;
  uniform vec3 uA, uB, uC, uD;
  uniform float uScale, uGrain, uContrast, uAccent;
  varying vec2 vUv;

  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uAspect;
    vec2 p = uv * uScale;
    float t = uTime;

    // Domain warping: el ruido deforma sus propias coordenadas dos veces.
    // Es lo que convierte manchas en un campo que parece pintado.
    vec2 q = vec2(snoise(p + t * 0.10), snoise(p + vec2(5.2, 1.3) - t * 0.08));
    vec2 r = vec2(
      snoise(p + 2.4 * q + vec2(1.7, 9.2) + t * 0.13),
      snoise(p + 2.4 * q + vec2(8.3, 2.8) - t * 0.11)
    );
    float f = snoise(p + 2.6 * r) * 0.5 + 0.5;
    f = clamp((f - 0.5) * uContrast + 0.5, 0.0, 1.0);

    // Base: dos tonos de papel. El acento entra por encima y dosificado, que
    // un fondo bueno se nota cuando lo quitas, no cuando lo miras.
    vec3 col = mix(uA, uB, f);
    col = mix(col, uC, clamp(length(q) * 0.55, 0.0, 1.0) * uAccent);
    col = mix(col, uD, smoothstep(0.55, 1.0, r.x * 0.5 + 0.5) * uAccent * 0.7);

    // Grano: sin esto se ven bandas en pantallas de 8 bits.
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (g - 0.5) * uGrain;

    gl_FragColor = vec4(col, 1.0);
  }
`;function R(a){const e=f(a,{speed:.06,scale:.75,grain:.035,contrast:1.25,accent:.35,colors:["--color-paper","--color-paper-alt","--color-brand-soft","--color-brand"],dpr:.5}),t=new h({alpha:!1,antialias:!1,dpr:e.dpr}),n=t.gl,i=n.canvas;i.setAttribute("data-fx-canvas",""),i.setAttribute("aria-hidden","true"),a.appendChild(i);const[x,m,p,d]=e.colors.map((o,c)=>g(o,[[.96,.96,.94],[.93,.93,.9],[1,.99,.79],[1,1,0]][c])),v=new b(n,{vertex:q,fragment:T,uniforms:{uTime:{value:0},uAspect:{value:new C(1,1)},uA:{value:new s(...x)},uB:{value:new s(...m)},uC:{value:new s(...p)},uD:{value:new s(...d)},uScale:{value:e.scale},uGrain:{value:e.grain},uContrast:{value:e.contrast},uAccent:{value:e.accent}}}),u=new A(n,{geometry:new z(n),program:v}),l=()=>{const{clientWidth:o,clientHeight:c}=a;if(!o||!c)return;t.setSize(o,c);const r=o/c;v.uniforms.uAspect.value.set(r>1?r:1,r>1?1:1/r)};new ResizeObserver(l).observe(a),l(),t.render({scene:u}),!w()&&y(a,o=>{v.uniforms.uTime.value=o/1e3*e.speed*10,t.render({scene:u})})}export{R as init};
