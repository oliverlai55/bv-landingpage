(function () {
  // NoLimit/Heap init
  var trackNL = function (evtName, props) {
    if (typeof nolimit !== 'undefined' && nolimit.track) {
      if (props) {
        nolimit.track(evtName, props);
      } else {
        nolimit.track(evtName);
      }
    }
    if (typeof heap !== 'undefined' && heap.track) {
      if (props) {
        heap.track(evtName, props);
      } else {
        heap.track(evtName);
      }
    }
  };

  // Test for Safari private browsing mode
  try {
    localStorage.test = 2;
  } catch (e) {
    trackNL("Safari Private Browsing");
  }

  var BrowserDetect = {
    init: function () {
      this.browser = this.searchString(this.dataBrowser) || "Other";
      this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
      for (var i = 0; i < data.length; i++) {
        var dataString = data[i].string;
        this.versionSearchString = data[i].subString;

        if (dataString.indexOf(data[i].subString) !== -1) {
          return data[i].identity;
        }
      }
    },
    searchVersion: function (dataString) {
      var index = dataString.indexOf(this.versionSearchString);
      if (index === -1) {
        return;
      }

      var rv = dataString.indexOf("rv:");
      if (this.versionSearchString === "Trident" && rv !== -1) {
        return parseFloat(dataString.substring(rv + 3));
      } else {
        return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
      }
    },

    dataBrowser: [
      {
        string: navigator.userAgent,
        subString: "Edge",
        identity: "MS Edge"
      },
      {
        string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
      },
      {
        string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer"
      },
      {
        string: navigator.userAgent,
        subString: "Trident",
        identity: "Explorer"
      },
      {
        string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
      },
      {
        string: navigator.userAgent,
        subString: "Safari",
        identity: "Safari"
      },
      {
        string: navigator.userAgent,
        subString: "Opera",
        identity: "Opera"
      }
        ]
  };

  var REQUEST_DELAY = 300; // ms

  var $headerSearchPeople = $('#header-search-people'),
    $headerSearchPhone = $('#header-search-phone'),
    $headerSearchEmail = $('#header-search-email'),
    $headerSearchProperty = $('#header-search-property'),
    $addressField = $('#fullAddress');

  //Ticker Counter
  $.ajax({
    url: "https://www.beenverified.com/stats/report_count.json",
    dataType: 'json',
    success: function (data) {
      //data = JSON.parse(data);
      jCounter({
        startCount: data.startCount,
        slope: data.slope,
        afterUpdateCallback: function (currentCount) {

          count = currentCount + '';
          count_items = count.padWithZeros(8).split("");

          for (i = 0; i < count_items.length; i++) {
            $("#tick_" + i).html(count_items[i]);
          }
        }
      }).countIt();
    }
  });

  // $.ajax({
  //     type: "GET",
  //     url: "/internal/api/state_for_ip",
  //     dataType: "json",
  //     success: function (data, textStatus) {
  //         $("SELECT").val(data.state);
  //     }
  // });

  //AutoPlay video and turn off sound when modal is closed
  var autoPlayYouTubeModal = function () {
    var trigger = $("body").find('[data-toggle="modal"]');
    trigger.click(function (e) {
      e.preventDefault();
      var theModal = $(this).data("target"),
        videoSRC = $(this).attr("data-theVideo"),
        videoSRCauto = videoSRC + "?autoplay=1";
      $(theModal + ' iframe').attr('src', videoSRCauto);
      $(theModal).on('hide.bs.modal', function (e) {
        //console.log('modal closed');
        $(theModal + ' iframe').attr('src', videoSRC);
      });
    });
  };

  // Back To Top
  $(".backToTop").click(function () {
    $('html, body').animate({
      scrollTop: $(".home-search").offset().top
    }, 500);
  });

  //Search carousel selector
  $('.home-carousel-indicator').on('click', function () {
    $('.home-carousel-indicator').removeClass('active');
    $(this).addClass('active');
  });

  var initAddress = function () {
    // address verification
    var liveaddress = $.LiveAddress({
      debug: false,
      key: "137296413373292866",
      addresses: [{
        street: $addressField
        }],
      ambiguousMessage: "Choose the exact address",
      invalidMessage: "We did not find that address in our records<br><span class='line_two'>Be sure to include a building number and leave out resident names</span>",
      stateFilter: "AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY",
      submitVerify: true
    });

    liveaddress.on("AddressWasAmbiguous", function (event, data, previousHandler) {
      // $('a.smarty-popup-close').html('<span class="glyphicon glyphicon-remove-circle"></span>');
      previousHandler(event, data);
    });

    // refocus search form if invalid
    liveaddress.on("InvalidAddressRejected", function (event, data, previousHandler) {
      $addressField.focus();
    });

    liveaddress.on("AddressChanged", function (event, data, previousHandler) {
      $addressField.removeClass("success");
      previousHandler(event, data);
    });

    liveaddress.on("AddressAccepted", function (event, data, previousHandler) {
      var chosen = data.response.chosen;

      amplify.store('propertySearchData', {
        address: chosen.delivery_line_1 + " " + chosen.last_line,
        street: chosen.delivery_line_1 || "",
        last_line: chosen.last_line || "",
        city: chosen.components.city_name || "",
        state: chosen.components.state_abbreviation || "",
        unit: chosen.components.secondary_number || "",
        zip5: chosen.components.zipcode || "",
        zip4: chosen.components.plus4_code || ""
      });
      amplify.store('propertyCurrentRecord', {
        _framerida_click: "store propertyCurrentRecord",
        _framerida_mapped: "TeaserRecord",
        parcel_address: {
          address: chosen.delivery_line_1 + " " + chosen.last_line,
          full: chosen.delivery_line_1 || "",
          parts: {
            carrier_route: chosen.metadata.carrier_route || "",
            city: chosen.components.city_name || "",
            house_number: chosen.components.primary_number || "",
            post_direction: chosen.components.street_postdirection || "",
            pre_direction: chosen.components.street_predirection || "",
            state: chosen.components.state_abbreviation || "",
            street_name: chosen.components.street_name || "",
            street_type: chosen.components.street_suffix || "",
            unit: chosen.components.secondary_number || "",
            zip: chosen.components.zipcode || "",
            zip4: chosen.components.plus4_code || ""
          }
        }
      });

      $addressField.addClass("success");
      $addressField.focus();

      previousHandler(event, data);
    });
  };

  if ($headerSearchPeople.length !== 0) {

    $headerSearchPeople.validate({
      validClass: "success",

      rules: {
        fn: "required",
        ln: "required"
      },
      messages: {
        fn: "Please enter a first name",
        ln: "Please enter a last name"
      },

      onkeyup: false,
      onclick: false,
      onsubmit: true,
      submitHandler: function (form) {
        trackNL("Submitted Search Form - People");
        window.setTimeout(function () {
          form.submit();
        }, REQUEST_DELAY);
      }
    });

  }

  if ($headerSearchPhone.length !== 0) {

    $.validator.addMethod("phoneUS", function (phone_number, element) {
      phone_number = phone_number.replace(/\s+/g, "");
      return this.optional(element) || phone_number.length > 9 &&
        phone_number.match(/^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/);
    }, "Please specify a valid phone number");

    $headerSearchPhone.validate({
      validClass: "success",

      rules: {
        "phone": {
          required: true,
          phoneUS: true
        }
      },
      messages: {
        phone: "Please enter a phone number. e.g., (212) 555-6789"
      },

      onkeyup: false,
      onclick: false,
      onsubmit: true,
      submitHandler: function (form) {
        trackNL("Submitted Search Form - Phone");
        window.setTimeout(function () {


          var phoneNumber = $("#phone").val(),
                cleanNumber = phoneNumber.replace(/\D/g, '');

          $('#phone').val(cleanNumber);




          form.submit();
        }, REQUEST_DELAY);
      }
    });

  }

  if ($headerSearchEmail.length !== 0) {

    $headerSearchEmail.validate({
      validClass: "success",

      rules: {
        "emailaddress": {
          required: true,
          email: true
        },
      },
      messages: {
        "emailaddress": "Please enter an Email Address"
      },

      onkeyup: false,
      onclick: false,
      onsubmit: true,
      submitHandler: function (form) {
        trackNL("Submitted Search Form - Email");
        window.setTimeout(function () {
          form.submit();
        }, REQUEST_DELAY);
      }
    });

  }

  if ($headerSearchProperty.length !== 0) {

    $headerSearchProperty.validate({
      rules: {
        $fullAddress: "required"
      },
      messages: {
        address: "Please enter an address"
      },

      onkeyup: false,
      onclick: false,
      onsubmit: true,
      submitHandler: function (form) {
        trackNL("Submitted Search Form - Reverse Property");
        window.setTimeout(function () {
          form.submit();
        }, REQUEST_DELAY);
      }
    });

  }

  //Testimonial people icon selector
  $('.testimonial-photo').on('click', function () {
    $('.testimonial-photo').removeClass('active');
    $(this).addClass('active');
  });

  //Testimonial press icon selector
  $('.testi-press').on('click', function () {
    $('.testi-press').removeClass('active');
    $(this).addClass('active');
  });

  var scrollAnimation = function () {
    var animateShimmer = function () {
      var $s1 = $('#home-search-carousel.search-form');
      var $b1 = $('.carousel-inner .item .btn-search');

      /* beautify preserve:start */
      var sequence = [
        { e: $s1, p: {backgroundPositionX: 0}, o: {delay: 600, duration: 3600, easing: "easeInCubic"} }
      ];
      /* beautify preserve:end */

      $.Velocity.RunSequence(sequence);

      _.delay(function() {
        $b1.velocity({
          backgroundColor: '#72c23f'
        }, {
          duration: 800,
          loop: true
        });
      }, 3300);
    };

    var shimmerWaypoint = $('.home-search .trigger').waypoint(function (direction) {
      animateShimmer();
      this.destroy();
    }, {
      offset: '60%'
    });

    $('#background-checks .screenshot').velocity({
      scale: 0.9
    }, {
      duration: 0
    });

    var animateBullets = function () {
      var $screenshot = $('#background-checks .screenshot');
      var $b1 = $('#background-checks .bullet-one');
      var $b2 = $('#background-checks .bullet-two');
      var $b3 = $('#background-checks .bullet-three');
      var $b4 = $('#background-checks .bullet-four');
      var $button = $('#background-checks .box-button a.btn');


      $screenshot.velocity({
        scale: 1,
        top: 15
      }, {
        duration: 1200
      });

      /* beautify preserve:start */
      var sequence = [

        { e: $b1, p: {left: 0}, o: {duration: 600, easing: "easeInOutQuad"} },
        { e: $b2, p: {left: 0}, o: {duration: 600, easing: "easeInOutQuad"} },
        { e: $b3, p: {left: 0}, o: {duration: 600, easing: "easeInOutQuad"} },
        { e: $b4, p: {left: 0}, o: {duration: 600, easing: "easeInOutQuad"} },

        { e: $button, p: {scaleX: 0.9, scaleY: 0.9}, o: {duration: 300} },
        { e: $button, p: {scaleX: 1, scaleY: 1}, o: {duration: 300} }
      ];
      /* beautify preserve:end */

      $.Velocity.RunSequence(sequence);
    };

    var bulletsWaypoint = $('#background-checks .trigger').waypoint(function (direction) {
      animateBullets();
      this.destroy();
    }, {
      offset: '60%'
    });

    var animateApps = function () {
      var $b1 = $('#app .app-one');
      var $b2 = $('#app .app-two');
      var $b3 = $('#app .app-three');
      var $b4 = $('#app .app-four');
      var $s1 = $('#app .star-one');
      var $s2 = $('#app .star-two');
      var $s3 = $('#app .star-three');
      var $s4 = $('#app .star-four');
      var $s5 = $('#app .star-five');

      /* beautify preserve:start */
      var sequence = [
        { e: $b1, p: {top: 0}, o: {duration: 800} },
        { e: $b2, p: {top: 0}, o: {duration: 800, delay: 100, sequenceQueue: false} },
        { e: $b3, p: {top: 0}, o: {duration: 800, delay: 200, sequenceQueue: false} },
        { e: $b4, p: {top: 0}, o: {duration: 800, delay: 300, sequenceQueue: false} },
        { e: $s1, p: {opacity: 1}, o: {duration: 300, sequenceQueue: false} },
        { e: $s2, p: {opacity: 1}, o: {duration: 300} },
        { e: $s3, p: {opacity: 1}, o: {duration: 300} },
        { e: $s4, p: {opacity: 1}, o: {duration: 300} },
        { e: $s5, p: {opacity: 1}, o: {duration: 300} }
      ];
      /* beautify preserve:end */

      $.Velocity.RunSequence(sequence);
    };

    var appsWaypoint = $('#app .trigger').waypoint(function (direction) {
      animateApps();
      this.destroy();
    }, {
      offset: 'bottom-in-view'
    });

    var animateVideo = function () {
      var $videoBtn = $('#video .video-play-btn');

      $videoBtn.velocity({
        scale: 1.2
      }, {
        duration: 1000,
        loop: true
      });

    };

    var videoWaypoint = $('#video .trigger').waypoint(function (direction) {
      animateVideo();
    }, {
      offset: '50%'
    });

    var animateTimeline = function () {
      var $b1img = $('#timeline .bullet-one img');
      var $b1span = $('#timeline .bullet-one span');
      var $b2img = $('#timeline .bullet-two img');
      var $b2span = $('#timeline .bullet-two span');
      var $b3img = $('#timeline .bullet-three img');
      var $b3span = $('#timeline .bullet-three span');
      var $b4img = $('#timeline .bullet-four img');
      var $b4span = $('#timeline .bullet-four span');

      /* beautify preserve:start */
      var sequence = [
        { e: $b1img, p: {opacity: 1}, o: {duration: 100} },
        { e: $b1img, p: {scaleX: 1.3, scaleY: 1.3}, o: {duration: 200, easing: "easeInExpo"} },
        { e: $b1img, p: {scaleX: 1, scaleY: 1}, o: {duration: 300} },
        { e: $b1span, p: {opacity: 1, }, o: {sequenceQueue: false, duration: 300} },
        { e: $b2img, p: {opacity: 1}, o: {duration: 100} },
        { e: $b2img, p: {scaleX: 1.3, scaleY: 1.3}, o: {duration: 200, easing: "easeInExpo"} },
        { e: $b2img, p: {scaleX: 1, scaleY: 1}, o: {duration: 300} },
        { e: $b2span, p: {opacity: 1}, o: {sequenceQueue: false, duration: 300} },
        { e: $b3img, p: {opacity: 1}, o: {duration: 100} },
        { e: $b3img, p: {scaleX: 1.3, scaleY: 1.3}, o: {duration: 200, easing: "easeInExpo"} },
        { e: $b3img, p: {scaleX: 1, scaleY: 1}, o: {duration: 300} },
        { e: $b3span, p: {opacity: 1}, o: {sequenceQueue: false, duration: 300} },
        { e: $b4img, p: {opacity: 1}, o: {duration: 100} },
        { e: $b4img, p: {scaleX: 1.3, scaleY: 1.3}, o: {duration: 200, easing: "easeInExpo"} },
        { e: $b4img, p: {scaleX: 1, scaleY: 1}, o: {duration: 300} },
        { e: $b4span, p: {opacity: 1}, o: {sequenceQueue: false, duration: 300} }
      ];
      /* beautify preserve:end */

      $.Velocity.RunSequence(sequence);
    };

    var timelineWaypoint = $('#timeline .trigger').waypoint(function (direction) {
      animateTimeline();
      this.destroy();
    }, {
      offset: '50%'
    });

    var animateFooter = function () {
      var $s1 = $('#footer .star-one');
      var $s2 = $('#footer .star-two');
      var $s3 = $('#footer .star-three');
      var $s4 = $('#footer .star-four');
      var $s5 = $('#footer .star-five');

      /* beautify preserve:start */
      var sequence = [
        { e: $s1, p: {opacity: 1}, o: {duration: 300, sequenceQueue: false} },
        { e: $s2, p: {opacity: 1}, o: {duration: 300} },
        { e: $s3, p: {opacity: 1}, o: {duration: 300} },
        { e: $s4, p: {opacity: 1}, o: {duration: 300} },
        { e: $s5, p: {opacity: 1}, o: {duration: 300} }
      ];
      /* beautify preserve:end */

      $.Velocity.RunSequence(sequence);
    };


    var animateCarla = function () {
      var $c1 = $('.carla-hand');

      /* beautify preserve:start */
      var sequence = [
        { e: $c1, p: {bottom: "-10px", rotateZ: "80deg", rotateY: "0deg"}, o: {duration: 800} },
        { e: $c1, p: {rotateZ: "55deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "80deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "55deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "80deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "55deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "80deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "55deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "80deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "55deg"}, o: {duration: 200} },
        { e: $c1, p: {rotateZ: "0deg", rotateY: "90deg"}, o: {duration: 600} }
      ];
      /* beautify preserve:end */

      $.Velocity.RunSequence(sequence);
    };

    var footerWaypoint = $('#footer .trigger').waypoint(function (direction) {
      animateFooter();

      var goCarla = _.debounce(animateCarla, 1500, {
        leading: true,
        trailing: false
      });

      $('.carla-box').on('click', goCarla);

      _.delay(goCarla, 1500);

      this.destroy();
    }, {
      offset: 'bottom-in-view'
    });

  };

  var InlineVideo = function (settings) {
    if (settings.element.length === 0) {
      return;
    }
    this.init(settings);
  };

  InlineVideo.prototype.init = function (settings) {
    this.$element = $(settings.element);
    this.settings = settings;
    this.videoDetails = this.getVideoDetails();

    $(this.settings.closeTrigger).hide();
    this.setFluidContainer();
    this.bindUIActions();

    if (this.videoDetails.teaser && Modernizr.video && !Modernizr.touch) {
      this.appendTeaserVideo();
    }
  };

  InlineVideo.prototype.bindUIActions = function () {
    var that = this;
    $(this.settings.playTrigger).on('click', function (e) {
      e.preventDefault();
      if (!Modernizr.video || (BrowserDetect.browser === 'Explorer' && BrowserDetect.version <= 11)) {
        $('#video-modal').on('shown.bs.modal', function (e) {
          $("#vimeoplayer").vimeo("play");
        });
        $('#video-modal').modal('show');
        $('#video-modal').on('hide.bs.modal', function (e) {
          $("#vimeoplayer").vimeo("pause");
        });
      } else {
        that.animateOpen();
        that.appendIframe();
      }
    });
    $(this.settings.closeTrigger).on('click', function (e) {
      e.preventDefault();
      that.animateClosed();
      that.removeIframe();
    });
  };

  InlineVideo.prototype.animateOpen = function () {
    var that = this;
    $('#timeline').removeClass('slant').addClass('no-slant');
  };

  InlineVideo.prototype.animateClosed = function () {
    var that = this;
    $('#timeline').removeClass('no-slant').addClass('slant');
  };

  InlineVideo.prototype.appendIframe = function () {
    var html = '<iframe id="inline-video__video-element" src="' + this.videoDetails.videoURL + '?title=0&amp;byline=0&amp;portrait=0&amp;color=3d96d2&autoplay=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    // YOUTUBE ?rel=0&amp;hd=1&autohide=1&showinfo=0&autoplay=1&enablejsapi=1&origin=*
    // VIMEO http://player.vimeo.com/video/'+videoDetails.id+'?title=0&amp;byline=0&amp;portrait=0&amp;color=3d96d2&autoplay=1
    $(this.settings.playTrigger).fadeOut();
    $(this.settings.closeTrigger).fadeIn();
    this.$element.append(html);
  };

  InlineVideo.prototype.removeIframe = function () {
    $(this.settings.playTrigger).fadeIn();
    $(this.settings.closeTrigger).fadeOut();
    this.$element.find('#inline-video__video-element').remove();
  };

  InlineVideo.prototype.appendTeaserVideo = function () {
    var source = this.videoDetails.teaser;
    var html = '<video autoplay="true" loop="true" muted id="inline-video__teaser-video" class="inline-video__teaser-video"><source src="' + source + '.webm" type="video/mp4"><source src="' + source + '.mp4" type="video/mp4"></video>';
    this.$element.append(html);
  };

  InlineVideo.prototype.setFluidContainer = function () {
    var element = this.$element;
    element.data('aspectRatio', this.videoDetails.videoHeight / this.videoDetails.videoWidth);

    $(window).resize(function () {
      var windowWidth = $(window).width();
      var windowHeight = $(window).height();

      element.width(Math.ceil(windowWidth));
      element.height(Math.ceil(windowWidth * element.data('aspectRatio'))); //Set the videos aspect ratio, see https://css-tricks.com/fluid-width-youtube-videos/

      if (windowHeight < element.height()) {
        element.width(Math.ceil(windowWidth));
        element.height(Math.ceil(windowHeight));
      }
    }).trigger('resize');
  };

  InlineVideo.prototype.getVideoDetails = function () {
    var mediaElement = $(this.settings.media);

    return {
      videoURL: mediaElement.attr('data-video-URL'),
      teaser: mediaElement.attr('data-teaser'),
      videoHeight: mediaElement.attr('data-video-height'),
      videoWidth: mediaElement.attr('data-video-width')
    };
  };


  var initVideo = function () {
    $('.inline-video').each(function (i, elem) {
      var inlineVideo = new InlineVideo({
        element: elem,
        media: '.inline-video__media',
        playTrigger: '.inline-video__play-trigger',
        closeTrigger: '.inline-video__close-trigger'
      });
    });
  };

  var init = function () {
    BrowserDetect.init();
    //scrollAnimation();
    //initVideo();

    //autoPlayYouTubeModal();
    $('.carousel').carousel();

    //Placeholder fix for older browsers
    //$('input, textarea').placeholder();

    $('.focus-me').focus();
    //initAddress();
    $('.carousel').on('slid.bs.carousel', function (evt) {
      if (($('.carousel div.active').index() + 1) === 4) {
        initAddress();
      }
    });
    $('a.smarty-popup-close').html('<span class="glyphicon glyphicon-remove-circle"></span>');
  };

  init();
}());



/**
 * Targeted Content P.O.C.
 */
(function ($, _) {

  var bv_info = {

  };

  /*
   * @private
   * Parses query arguments and returns them as an object.
   */
  var parseQueryArgs = function (query) {
    if (!query) {
      return null;
    }
    var args = _
      .chain(query.split('&'))
      .map(function (params) {
        var p = params.split('=');
        var key = p[0];
        var val = window.decodeURIComponent(p[1]);
        val = val.replace(/\/+$/g, ""); // clean up trailing slash
        val = val.replace(/\+/g, " "); // replace white spaces
        return [key, val];
      })
      .object()
      .value();
    return args;
  };

  var findDynamicContent = function () {
    return $("[data-bv-content]");
  };

  var displayTargetedContent = function (queryArgs, $dynamicElems) {
    var ref = queryArgs.pagetype,
      kw = ref && ref.toLowerCase().replace(' ', '');

    if (!ref) return;

    _.forEach($dynamicElems, function (elem) {
      var $elem = $(elem),
        $defaults = $elem.find("[data-bv-ref=default]");
      $target = $elem.find("[data-bv-ref=" + kw + "]");
      if (!$target || $target.length === 0) {
        $defaults.show();
      } else {
        $defaults.hide();
        $target.show();
      }
    });
  };

  var show = function () {
    $("body").removeClass("hide");
  };

  var decodeSearchArgs = function (keywordString) {
    var keywords = keywordString.split('+');
    keywords = _.map(keywords, function (kw) {
      if (kw) {
        return kw.toLowerCase();
      }
      return kw;
    });
    return keywords;
  };

  var initialize = function () {
    var query = window.location.search.substring(1),
      queryArgs = parseQueryArgs(query);

    var referrer = window.referrer;

    if (queryArgs) {
      $dynamicElems = findDynamicContent();
      displayTargetedContent(queryArgs, $dynamicElems);
    }
    $('#navCollapse').on('hidden.bs.collapse', function () {
      // do something…
      $('#nav-icon-closed').show();
      $('#nav-icon-open').hide();
    });
    $('#navCollapse').on('shown.bs.collapse', function () {
      // do something…
      $('#nav-icon-closed').hide();
      $('#nav-icon-open').show();
    });
    //mask for phone input
    $("#phone").mask('(000) 000-0000');
  };

  try {
    initialize();
    show();
  } catch (err) {
    show();
    throw err;
  }

  window.targeted = {
    initialize: initialize
  };

}(jQuery, _));
