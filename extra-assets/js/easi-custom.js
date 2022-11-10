(function ($) {
  // ALLOCATION BUTTONS
  $("#allocation-select").parent().append("<div class='allocation-btns'></div>")

  $("#allocation-select option").each(function() {
    label = "<strong>"+$(this).text().replace(/\: /g, "</strong><br>")
    var btn = $('<div class="btn btn-easi-toggle" data-value="'+$(this).val()+'">'+label+'</div>');
    $('.allocation-btns').append(btn);
  });
  $("#allocation-select").hide()

  $(document).on('click', '.allocation-btns .btn-easi-toggle', function() {
      $('.btn-easi-toggle').removeClass('on');
      $(this).addClass('on');
      $("#allocation-select").val($(this).data("value"));
  });

  // RESOURCE BUTTONS
  $("#resources-select").parent().append("<div class='resource-btns'></div>")

  $("#resources-select option").each(function() {
    label = $(this).text().replace(/\;/g, "<br>")
    label = label.replace(/\<</g,"<strong>").replace(/\>>/g,"</strong><br>")
    var btn = $('<div class="btn btn-easi-toggle" data-value="'+$(this).val()+'">'+label+'</div>');
    $('.resource-btns').append(btn);
  });
  $("#resources-select").hide()

  $(document).on('click', '.resource-btns .btn-easi-toggle', function() {
      $('.btn-easi-toggle').removeClass('on');
      $(this).addClass('on');
      $("#resources-select").val($(this).data("value"));
      showInfo();
  });


})(jQuery);