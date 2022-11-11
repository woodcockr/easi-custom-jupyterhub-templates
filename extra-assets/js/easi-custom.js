(function ($) {
  // ALLOCATION BUTTONS
  $("#allocation-select").parent().append("<div class='allocation-btns'></div>")

  $("#allocation-select option").each(function() {
    if ($(this).val() != "UNALLOCATED") { // Don't show UNALLOCATED
      label = "<strong>"+$(this).text().replace(/\: /g, "</strong><br>")
      var btn = $('<div class="btn btn-easi-toggle" data-value="'+$(this).val()+'"><span>'+label+'</span></div>');
      $('.allocation-btns').append(btn);
    }
  });
  $($('.allocation-btns .btn')[0]).addClass('on');
  $("#allocation-select").hide()

  $(document).on('click', '.allocation-btns .btn-easi-toggle', function() {
      $('.allocation-btns .btn-easi-toggle').removeClass('on');
      $(this).addClass('on');
      $("#allocation-select").val($(this).data("value"));
  });

  // RESOURCE BUTTONS
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

  $('#kubespawner-profiles-list').on('change', function() {
    $('#kubespawner-profiles-list input[type="radio"]').each(function(){
      if ($(this).is(':checked')) {
        $(this).closest('label').addClass('selected')
      } else {
        $(this).closest('label').removeClass('selected')
      }
    });
  })

})(jQuery);