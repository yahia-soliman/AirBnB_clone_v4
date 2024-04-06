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
$.get('http://0.0.0.0:5001/api/v1/status/', function (data, textStatus, jqXHR) {
  if (textStatus === 'OK') {
    $('#api_status').addClass('available');
  } else {
    $('#api_status').removeClass('available');
  }
}
);
