(function ($) {
  // ALLOCATION BUTTONS
  // Comment out this section to disable the conversion of the allocation selection dropdown to buttons
  $("#allocation-select").parent().append("<div class='allocation-btns'></div>")

  $("#allocation-select option").each(function() {
      label = "<strong>"+$(this).text().replace(/\: /g, "</strong><br>")
      var btn = $('<div class="btn btn-easi-toggle" data-value="'+$(this).val()+'"><span>'+label+'</span></div>');
      $('.allocation-btns').append(btn);
  });

  $($('.allocation-btns .btn')[0]).addClass('on');
  $("#allocation-select").hide()

  $(document).on('click', '.allocation-btns .btn-easi-toggle', function() {
      $('.allocation-btns .btn-easi-toggle').removeClass('on');
      $(this).addClass('on');
      $("#allocation-select").val($(this).data("value"));
  });
  // END ALLOCATION BUTTONS

  // RESOURCE BUTTONS
  // Comment out this section to disable the conversion of the resource selection dropdown to buttons
  $("#resources-select").parent().append("<div class='resources-btns'></div>")

  $("#resources-select option").each(function() {
    label = $(this).val().replace(/\;/g, "<br>")
    label = label.replace(/\|\-/g,"<strong>").replace(/\-\|/g,"</strong><br>")
    var btn = $('<div class="btn btn-easi-toggle" data-value="'+$(this).val()+'"><span>'+label+'</span></div>');
    $('.resources-btns').append(btn);
  });
  $($('.resources-btns .btn')[0]).addClass('on');
  $("#resources-select").hide()

  $(document).on('click', '.resources-btns .btn-easi-toggle', function() {
      $('.resources-btns .btn-easi-toggle').removeClass('on');
      $(this).addClass('on');
      $("#resources-select").val($(this).data("value"));
      showInfo();
  });

  // END RESOURCE BUTTONS

  // SPAWNER LOGOS
  // Comment out this section to stop adding custom styling to spawner logos
  cols = $('.spawner-logos').closest('.col-md-11');
  cols.each(function(){
    $(this).removeClass('col-md-11');
    $(this).addClass('col-md-9');
    logos = $(this).find('.spawner-logos')
    logos.addClass('col-md-2');
    $(this).closest('label').append(logos);
  })

  $('.spawner-logos').addClass('col-md-2');
  $('.spawner-logos .r-logo').append('<img src="/hub/static/extra-assets/images/r-logo.png">');
  $('.spawner-logos .xt-logo').append('<img src="/hub/static/extra-assets/images/XT-logo.png">');
  $('.spawner-logos .python-logo').append('<img src="/hub/static/extra-assets/images/python-logo.png">');
  $('.spawner-logos .nvidia-logo').append('<img src="/hub/static/extra-assets/images/nvidia-logo.png">');
  // END SPAWNER LOGOS

  // SPAWNER STYLING
  // Coment out this section to stop adding custom styling to spawner groups
  $('#kubespawner-profiles-list').on('change', function() {
    $('#kubespawner-profiles-list input[type="radio"]').each(function(){
      if ($(this).is(':checked')) {
        $(this).closest('label').addClass('selected')
      } else {
        $(this).closest('label').removeClass('selected')
      }
    });
  })
  // END SPAWNER STYLING

})(jQuery);