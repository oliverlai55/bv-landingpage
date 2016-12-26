$(document).ready(function() {

  (function initPercentage() {
    var $progressbarWrap = $('.progressbar-wrapper').width()
    var $progressBar = $('#progressbar')
    var $percentText = $('#percent-text')
    var setPercentage = setInterval(addPercentageText, 10);
    var $progressbarContent = $('.progressbar-content');
    var $searchbarContent = $('.searchbar-content');

    function addPercentageText() {
        var barWidth = $progressBar.width()
        var widthPercent = (100 - Math.round((barWidth / $progressbarWrap) * 100)) + '%'

        $percentText.text(widthPercent)

        if (barWidth == $progressbarWrap) {
          clearInterval(setPercentage);
          
          $progressbarContent.addClass('hidden');
          $searchbarContent.fadeIn(1500).removeClass('hidden');
        }
    }
  }());
});
