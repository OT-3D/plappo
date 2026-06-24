/* ============================================================
   PLAPPO – animated mouth/face for the warm-up demonstrations.
   A friendly SVG face whose mouth/tongue/cheeks animate to SHOW
   each Mundmotorik exercise, so the child can copy it.
   anim keys: tongueClick, tongueUp, blow, kissSmile, fish,
              cheeks, teeth, lickCircle
   ============================================================ */
window.PlappoFace = (function(){
  const SVG =
  '<svg class="mouthface" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<circle class="mf-face" cx="100" cy="100" r="82"/>'+
    '<circle class="mf-cheek mf-cheek-l" cx="30" cy="116" r="17"/>'+
    '<circle class="mf-cheek mf-cheek-r" cx="170" cy="116" r="17"/>'+
    '<circle class="mf-eye" cx="70" cy="72" r="8"/>'+
    '<circle class="mf-eye" cx="130" cy="72" r="8"/>'+
    '<ellipse class="mf-lips" cx="100" cy="132" rx="40" ry="24"/>'+
    '<ellipse class="mf-open" cx="100" cy="133" rx="28" ry="12"/>'+
    '<rect class="mf-teeth" x="74" y="120" width="52" height="11" rx="4"/>'+
    '<ellipse class="mf-tongue" cx="100" cy="142" rx="16" ry="11"/>'+
    '<g class="mf-bubbles">'+
      '<circle cx="150" cy="122" r="7"/><circle cx="167" cy="135" r="5"/><circle cx="158" cy="105" r="6"/>'+
    '</g>'+
  '</svg>';

  function build(anim){
    const wrap = document.createElement("div");
    wrap.className = "mouthface-wrap";
    wrap.innerHTML = SVG;
    const svg = wrap.firstChild;
    svg.classList.add("anim-" + (anim || "fish"));
    return wrap;
  }
  return { build };
})();
