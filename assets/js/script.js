window.addEventListener('load', () => {
  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(() => {
      hero.classList.add('show');

      // Po určitém zpoždění zobrazíme ikony
      setTimeout(showHeroIcons, 900); // uprav si čas podle potřeby
    }, 300); // první náběh hero
  }
});

function showHeroIcons() {
  document.querySelector('.hero-icons')?.classList.add('visible');
}
