$(() => {
  const checkedAmenity = {};
  const amentiesH4 = $('.amenities h4');

  $('.amenities input[type="checkbox"]').on('change', function () {
    if (this.checked) {
      checkedAmenity[this.dataset.id] = this.dataset.name;
    } else delete checkedAmenity[this.dataset.id];
    amentiesH4.text(Object.values(checkedAmenity).join(', '));
  });
});
