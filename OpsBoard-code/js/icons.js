/* ============================================================
   SCRIPT.JS — OpsBoard · Logique principale
   ============================================================ */
'use strict';

/* ============================================================
   ICÔNES BASE64 — HW bar (uploadées par l'utilisateur) + Badges IA
   ============================================================ */
const B64 = {
  /* Hardware bar */
  gpu:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+oEExAiDpALBKIAAAIHSURBVEjH7dNbaM9hHMfx17M55dAccygppzIpbGQ0F/9lmbmi1LiQcii3Lpgbf0W5cueCKzdYiRu2thhhaczu1mKhyXIoxyFW9LjY///f788u/Melz9XT53me9/f7fb7Pl//6awXiNLsUo8/5EAsFjMJetdqwA+dGAuCr95p8s2hkJUy130bXcaSguwO2hsYwuI7pDC/95/djmpAugthTYOyEiiAsdjRBnhFPxt74PQ6n77E3nozT8wBxc/w2lEFcoNMYx3UqdUGvBSGEYKFnTtnngRqzdcb5yQzKnchmEIs0mKBNiXYVqnQ7H0MMLpjkjsnarZXSpSGGZBuHVGm0Wpe9tNIP1W7qsk6RMWpd8tqKnFuZeIOEyr3yWbMXSjS7pttE5Rm3RZ8SLTk3B+hwKNGFJS7aaawgOGubhwk3kOcOAkJjGJfrwgP9Sm2Q8sEsNcabo0OHfqWq1fhopk0Zd+gNYo9FGcRtX12xyh7LPdenySN38cVVZXZb6ZmXmjzWpmqYfxCiOsu0umeNfuv12xFiiLZb6ob7KnxU6ZO67Nz+2gXhSSxTr9Fcq8HT3ITPU+eHwy4rC2+z5m8AwhsHHCjoK/+N8jM4EgsZqgFbhgADUqg3LlFKOnk6poffyQJOK8YZ+6TQKkjFg3nx1g26aB2mhPDOMYhZEMWm5AFuZdzB3f/6l/oJW8q5+k8on1oAAAAASUVORK5CYII=',
  vram: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+oEExAiDpALBKIAAALlSURBVEjHxdXNb1RlFAbw33tn5nY6baXyISmJkCa0CSTEhdFa4kIi3TUuXPh/+G+5kA2JG01Y8WFDFDQZo4jaSIVQSj+nnbl33tfFTDv0g7pwwbmLm5N7z5P3Oec5z8ubjrA/TQyZsuy53IS2FzhlyD86zjjtN+39JdUD5RXnXPfMgui6HbdxVd23Mh84a8ti6obDAIkgxzlXnTdrwp8+Miph3qZlk2b87SqWEh0pvEohMWTetBPG1DVsaRlXs4KTCqsaRm3ZsWHNr27uUhlQqLhkzfeCKAiIyA69k8su+WYfhdQ7y7D7vjvQ1UORyH0skIQeQCIz4oK6SMr6X/b+35cFUVQ36S9bKYY+hXGzPjcmoqFUUZWhq0BNBVGpq2pT9K4vfe2Old0evGPakCTKnbIj15BLdrQwbFhQaGkb0hElQ6b9PgB46Sel9wS5MR07SlVJoYNSW1AqVb3lhWDDA00vB1N4JplAJlNTWFWGw82rGldTkWHVA8/1x0PDZXPGxd2RHDcE0bg5lzUGAFM+tKIlKbV0X1ve1VJKWlbMmBoAPHHPY4VMaVshHlkedbSUMoXH7nnSBwgse2RYLiD9J4lMru6R5dADSDRMOq8mqmqoOVqOmVxDVVfNBZMaaY/CFdc8tdEHqHqdnisaaqINT11zZTDGpopP5DIcvwyhf5LSLc0+QJDWPTEil+kq1LytmgZCqsn3hFToyuRGLFkfLNNJFwWlpLAhqr9WyusKSSlz0UZa2V2mabM2bYs6XihVrPcdocCmDKm/TB3Rtk2zttzd7cEPCl8YVUHr0Dq3X8k6qBh1wld+HuigremGZRkhhhTi3pMOZD1XWnZDs2dq1V5rU8tDn5pSpKArHGFlRElFMuWZh1oHPbHrF9PmjKkbsXmsqTYH+zIA6LipZ+vvG9P0h3l1d/CZbbdMmrHmvtuW0DkAEEjaiUWcsWBBdNqOu8jU/eihJWfdtmjfxfK/r7Y3H/8C4pND9Z9KiUAAAAAASUVORK5CYII=',
  bw:   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+oEExAiDpALBKIAAAMvSURBVEjHjdVNTFRnFAbg58KAM4D8CNigJAoVVErbNGDaRASlqTHtoppom7homq676aK7brvqpouu26ZNjCkb3dSExv6gpjHSNrZVlMEObdCkAgURmYFhuF04/AwzKGdzk++e7/1y3vec9wQKRPj4E6w/CgrkRmwUFRpViiJlxpjZwmnrQENK7dKqSaMGFbZg3qx77koY9reFoDBACKXqtenRpVmJRxakUaJUubSES35y07iF1YtBTon7nXJajSk3/GLYpBlUqtOiQ7tqU87oMyRcvroKUGSnD71tUp8fjEqKqFeOOePSYpoccVKtsz5xz1KQR2LSqHMGXLakTadn1YohadId1wxJuO2wfyTzOAihWJPAmDZH9dqDB5KIqRKIu6jfkF1CIzL5JSzHMz5yTLHrrhjxAFX2OOhFGRd87N/ctyO5YoSEZl0w4JK0YjX404CvdeuRyle+UB80WfJAnRM61GHCoHPG1SiSMP9EgBWYPd7yrsA0qoW+9I2RDVs5JKZRyqS5bFJMsSE/iwu0eEVE2Qp4mVpRY5IBgmwHvuQ9d3zrpmKPFYnaYlEJ0krNS1oEGc95XbMv/GphmcTD3tfpsruiWQCWRB3wKi66Zn6l2Iy9OnRp8Jl+IgK7HdUrqkuzh2sEKdZgp1Cr4zJrzrfaYbtew+JGizw9wif9jAgl9GvV6bLzbueVELpoUMryUxl7vanLoH6JzZJYIiUlk0Pi535bGev1MoY874QOV8XR4mWDzvkjKCBjJNtNSfGc0pIW7dOWnYUlV5cnMGDO3NNaOTSt1nGd6jFu0HkTqgUSG1raCsB2H6gwYEBakRpMWVLqkG4Pfep+7pVInlKBCse84XdXjJhGuxYHvWDRBcFqbr4frBrKa3q1WDaUMpUY9r3vDGkUShQylCI13rHPgCsy9jugOc/SIg7qdstXpgp5Ysxux3Xr86O46yLqlWHOfRllWh1x0jZnxUytIzFr6/uccto2024YFDeZlbFWi07tqvznjD638mx9zWLZr8ehgovlr+ximSiwWNbAlGRX2047bBUVSuWstvTmLI1yjSqzJM4Y86hw8sYAm1zv/wP8Sy8in2oMIgAAAABJRU5ErkJggg==',
  ram:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAd0SU1FB+oEExAiDpALBKIAAAQOSURBVEjHhdXrT9Z1GAbwz/P8HixJEkQFCVMMT+hsME00jMk8oVvrMNOlrmltzmVb6y/gVS9a9SorW2tRbbmmZQdN0TK0JCPNUx7I1IpAOSXgA3L89cITeLy/7+59r2v38bq5o4WX38DwpXB3eDRcF4664rn2I8LdKKR62hjnNRulx+eO9gVF7wofYa5ccVFDNMtQLLdvBNE7gUNSLfCUKm1metIIFTItki0I70wQColI9LjlhiiXo90h01X62hCrpYtejiNyOwLcZ6UsSQLH/SlPpq/s1OVR80Std4rIHVJIt8RYTZokOKHCz46q0eWSX5UJLJULwW1LV2iWcxigyjY5ciQZpEZcuwad8qS6UNIY3AwuiRhsgSI1mmU5o9RIq0yTKk2HBhd1+luPAmMcjPYHh3CPZfL9o16+vd432IsavOodyV4ww73otkeNLFP6EUQgxSpjndNhqs12aBMYZoaRDnhb3BrLRAyw2CR/ORLckHuG+XLVC6Q47Bv1SBBIN1qPPbrN0WWfYlMN06Q66JM7wxUqUqtTilqfGONhaVod0iXHBO26JGmUYIWz6qWYGLnW9YhES0xXq95UP/vMg16R76RS5ZJNMkuBTpsxW48v/CfXzOsEiVYZq0GLfJvtNMZaB/WYItM2myTIk6bBBIVCr+u0QMyGq0UcboksdULjbfGDRkPl61Fmk38VekaKXbZLV6TRW1rN1+EL+4MrY7PQcnG9BjhjgyakmWCQWsfUGeshp52S7yltvnRMsURlftAbhCSb43EDtUhWpVSyFAlaNZptpDpnZIqqlu55MaVOm2uCD1QIIyLhQCvkqlKuyAn7ZHjRMFttFLNMoWZnFPhcomnitvvPTKO97pQOIoKSNUZr0m2RfX6RY6UG2dJ1aXJEkmxR5TJlaXbYefPEfOzYZThByRsqdZspNFCvHI/40Gmj5ajT4Lw/1EiVpd1xdQp02Okn3VeVICpFs4h0LTKNd7+4Ab61BbPkqbZbi2nifndRtvuU+U7vdSGJKjdKr70m+8qPzrtoral22KhAmiRzrBZ3XJ0Mk71nb//tjYSjPCdDhUr/6JCmwPPiNmrzsnXSFYn6SKvZBlnvpEv9ZSwoadEo1Ti1qrVrU++cGeZKstsDirUp1WyeDl86oPNGFYxFwvCoBIssFNrvglpbpcjVglnqfK3aQr122X1t5ftLQAjZVutVpkIbIoZ4zCqJ3nJKsYneVan3Vgp8lSBqhJcFtvtetwRPeBbrtSrykNeujs0tCa7sYyDLUmm22mOxKS44q9p8MZ86fDt4H28IueYYp8Yk9zio0mMu2WVX377faLG+TOFvOg2WrUrMMHliym5dulvYlbMdDVPD2eHQMC98MywLp4ex/sf8ZvsfY/mKkW+jbMYAAAAASUVORK5CYII=',
  /* Badges capacités IA — images uploadées */
  chat:  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oEFAo3D1zfzD8AAABxSURBVDjLzZJBCoAwDASD+Ln6EL/gUd9qHjIeRIqwrQkouKeQZEJ3qdk/xYSj5BQN6HWAXQNAtD9kn/8+IAPoeZABRExfddrDWC/IuedMu83tJNa4H6vrUWBrDOy53/uIDaCwpwAtliRwIingHs2XOgCHJ9CdW9hRLwAAAABJRU5ErkJggg==',
  vision:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oEFAo3D1zfzD8AAAEgSURBVDjL3dKxSoJhFAbgj2hTslrzJ0jox5sQ6VaqqStoqHtxNAQXMRACyZaGGhpaKhpaS9BIx6fBz1+xHGqrM33n5T3ne885bwj/Lmw60vJibOxFy5HN5eRVx94txrtjq9/Ri65Bx75UTk5qXwdcKy7Stz3hUeVLo4oHPNmeB/PucWk9hBAkGoaGmtIQQlDQxb38rKCG2wkg8Zbp70tiw1vUpvQqRkoxa6BlS1EbZxEtGaE6SXo4zX4bMhlRgkGGn6AXwso0X7br7LUyw6r4sBOzJtqKEueoR3TXOJMUh76RCyEEqX429GsUt+ZubuhsrV2FqP3MwEA90jdcLaw1O9zDN4fb8/zlcAvWOFCWl1d26GKJNX5hvlj0E3v/2fgE82VUB84ATlEAAAAASUVORK5CYII=',
  reasoning:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAQAAABuvaSwAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oEFAo3D1zfzD8AAAFISURBVCjPhZJPK0RRHIafGUMyRkaxwEJZ0JCyl5S1TGQjrCyV78BXECtZWchHEIqVyFJKZi2mmPFnw/VYTMM19xrv4nTe33l6ezv9ICQbK6dZs6YAbCZeNvroBHik6iE4abkSUFEqRDfRTifQxT6QAzrI0MR7FUiEktO8UOCRHBvACle0009r4jUuGaBAgXN2gQxJ+uj/q3Nanfs1mVPTPz5co4EnLrkO0YOMkk0E8dmznlq26IUXFi174gz15LE7AO54XPuWjNBtlAB4pvV/uJs7AO7opr4cUccAHFeH68P73thQ+Rtv3auHrvrp1LfL++nqX+iigWu/JusGLsahvb65GZlu+WpPFF4wiG6vLQbOV93PIt2TZNuXGjpDkocovMQTAzH9SixxUAvnOGM7Bl5mKNo5b9k4lZyuMuEVTZGJSX5OfFSvXwGOq0SpL/FTAAAAAElFTkSuQmCC',
  multi: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAQAAABu4E3oAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAD/h4/MvwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oEFAo3ENHXwcoAAAFISURBVDjLzZOxS0JRFMZ/V6UarCkIgkB0kYporLEpiKAoB/+DKGgtooaGcGhpa2pselMY0dISJTjUEBlIgwYFEUgNShAFX4NP8fnuK0fPcjj3nO983zmHC11qpu40wA4xX7ZCxrwEILUvu2X9tRHXx8AYX6MCcT8kZGE8+nuWiKc4yQIwr00gZ67tEC9LjRIl1hFzfHTEwjBjZhe0zJV5ACCuGzf3ypp5bpXkSKA+3WpaUeU1Dkrrx7O9Q5uwQS645JGyKSjNMeG2rEVYlDdSfDPkAk7Is8iU/ZSO1BI1JCXVq1RTmONlqUBzUJgkDNyborY5oEbUtuQMp823UXcGRxOsmE/O+M9UcIUk3XjJKywUiLwzRWX1rlXOqQaf0rM9OczSwwYzfNHfCSRBAoBY+z+yCXsKaFKuO+PPaIStxqU9gD1TpZvtF7eXpUoCDRHcAAAAAElFTkSuQmCC',
};

/* Injecte les mask-image CSS pour la barre HW ET les badges IA */
(function() {
  const s = document.createElement('style');
  s.textContent = [
    /* Barre hardware */
    `.hw-icon-gpu{-webkit-mask-image:url("${B64.gpu}");mask-image:url("${B64.gpu}") }`,
    `.hw-icon-vram{-webkit-mask-image:url("${B64.vram}");mask-image:url("${B64.vram}")}`,
    `.hw-icon-bw{-webkit-mask-image:url("${B64.bw}");mask-image:url("${B64.bw}")}`,
    `.hw-icon-ram{-webkit-mask-image:url("${B64.ram}");mask-image:url("${B64.ram}")}`,
    /* Badges IA — image via mask */
    `.bi-chat .bi-img{-webkit-mask-image:url("${B64.chat}");mask-image:url("${B64.chat}")}`,
    `.bi-vision .bi-img{-webkit-mask-image:url("${B64.vision}");mask-image:url("${B64.vision}")}`,
    `.bi-reasoning .bi-img{-webkit-mask-image:url("${B64.reasoning}");mask-image:url("${B64.reasoning}")}`,
    `.bi-multi .bi-img{-webkit-mask-image:url("${B64.multi}");mask-image:url("${B64.multi}")}`,
  ].join('');
  document.head.appendChild(s);
})();

/* ============================================================
   BADGES HTML
   chat/vision/reasoning/multi → image mask
   code → { }  star → ★  edge → SVG hexagone  moe → SVG triangle
   ============================================================ */
const MOE_SVG = `<svg style="width:12px;height:12px;color:#60a5fa" viewBox="0 0 12 12" fill="none">
  <path d="M6 1L11 11H1L6 1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
  <circle cx="6" cy="7" r="1.2" fill="currentColor"/></svg>`;

const EDGE_SVG = `<svg style="width:11px;height:11px;color:#9ca3af" viewBox="0 0 12 12" fill="none">
  <polygon points="6,1 10.5,3.5 10.5,8.5 6,11 1.5,8.5 1.5,3.5" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="6" cy="6" r="1.5" fill="currentColor"/></svg>`;

function capBadge(t) {
  switch(t) {
    case 'chat':      return `<span class="badge-icon bi-chat"      title="Chat / Général"><span class="bi-img"></span></span>`;
    case 'vision':    return `<span class="badge-icon bi-vision"    title="Vision"><span class="bi-img"></span></span>`;
    case 'reasoning': return `<span class="badge-icon bi-reasoning" title="Raisonnement"><span class="bi-img"></span></span>`;
    case 'multi':     return `<span class="badge-icon bi-multi"     title="Multilingue"><span class="bi-img"></span></span>`;
    case 'code':      return `<span class="badge-icon bi-code"      title="Code">{}</span>`;
    case 'star':      return `<span class="badge-icon bi-star"      title="Populaire">★</span>`;
    case 'moe':       return `<span class="badge-icon bi-moe"       title="MoE — Mixture of Experts">${MOE_SVG}</span>`;
    case 'edge':      return `<span class="badge-icon bi-edge"      title="Léger">${EDGE_SVG}</span>`;
    default: return '';
  }
}
function abliteratedBadge(abl) {
  return abl
    ? `<span class="badge-abliterated ba-unlock" title="Modèle débloqué">NON CENSURÉ</span>`
    : `<span class="badge-abliterated ba-lock"   title="Modèle standard">CENSURÉ</span>`;
}
function licBadge(lic, label) {
  return `<span class="lic-badge lic-${lic}">${label}</span>`;
}
