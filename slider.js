/*
SCRIPT: slider.js
AUTHOR: Michael Manning 2013
*/
(function($){
  $.fn.slider = function(param){
    //Local Variables
      if (typeof param === 'undefined') param = {};//Test to see if any set was passed in, if not, make an empty one
      var element = $(this);
      var root = (typeof param.root !== 'undefined')? param.root : 'http://www.montana.edu/success/';
      var pad = (typeof param.pad !== 'undefined')? param.pad : 5;
      var delay = (typeof param.delay !== 'undefined')? param.delay : 6000;
      var transition = (typeof param.transition !== 'undefined')? param.transition : 500;
      var changeDelay = (typeof param.changeDelay !== 'undefined')? param.changeDelay : 4000;
      var ajaxTimeout = (typeof param.ajaxTimeout !== 'undefined')? ajaxTimeout : 3000;//Error in ajax getImages set to sleep 5000
      var w = (typeof param.w !== 'undefined')? param.w : 750;//width
      var h = (typeof param.h !== 'undefined')? param.h : 300;//height
      var stepSize = (typeof param.stepSize !== 'undefined')? param.stepSize : 78;//From Flash
      var p = (typeof param.p !== 'undefined')? param.p : 0.88;//percent for links to be at
      var haveStep = (typeof param.haveStep !== 'undefined')? param.haveStep : true;
      var haveLinks = (typeof param.haveLinks !== 'undefined')? param.haveLinks : true;
      var captions = (typeof param.captions !== 'undefined')? param.captions : null;
      var imageLinks = (typeof param.imageLinks !== 'undefined')? param.imageLinks : null;
      var errorMsg = (typeof param.errorMsg !== 'undefined')? param.errorMsg : '<p>There has been an error.<br />Please check path provided. Error message returned in console.</p>';
      var tOut;//Local timeout variable for resetting animations
      var suicidal = false;

    //Immediate Runs
      // console.log($(element).attr("id"));
      getImages();//Retreive array of image urls
      if(suicidal) return false;//If ajax error, kill slider();
      createNav();//Initialize, create buttons and image
      resetDisabled();//Set current disabled
      animate(false);//Start animation loop
      $('head').append("<style>.slider button:focus{outline:none}</style>");//Remove any focus outlines that may happen on button clicks


    //Listeners
    $(document).ready(function($){
      //Mouse enter listener
      $(element).on('mouseenter', function(){
        $(element).find('.slider-nav').stop(true, true).fadeIn();
      });

      //Mouse leave listener
      $(element).on('mouseleave', function(){
        $(element).find('.slider-nav').stop(true, true).fadeOut();
      });

      //Banner listener, acts like clicking a link if an image is clicked and there is a link provided for that position
      $(element).on('click', $(element).find(".slider-image"), function(){
        if(imageLinks!=null&&typeof imageLinks[$(element).data("position")] !== 'undefined'){
          window.location.href = imageLinks[$(element).data("position")];
        }
      });

      //Left Click Listener
      $(element).find('#slider-left').on('click', function(e){
        e.stopImmediatePropagation();
        // console.log("left press");
        if($(element).data("position")<=0){//Is current position all the way to the left?
          $(element).data("position", $(element).data("images").length-1);
        }else{
          $(element).data("position", $(element).data("position")-1);
        }
        updateImage();
        animate(true);
      });

      //Right Click Listener
      $(element).find('#slider-right').on('click', function(e){
        e.stopImmediatePropagation();
        // console.log("right press");
        if($(element).data("position")>=$(element).data("images").length-1){//Is current position all the way to the right?
          $(element).data("position", 0);
        }else{
          $(element).data("position", $(element).data("position")+1);
        }
        updateImage();
        animate(true);
      });

      //Button link Listener
      $(element).find('.slider-link').on('click', function(e){
        e.stopImmediatePropagation();
        $(element).data("position", $(element).find(this).data("target"));
        updateImage();
        animate(true);
      });
    });
    
    //Functions
    function getImages(){
      $.ajax({
        url:'/success/ajax.php',
        async: false,//Prevent any other script from running until getting a response
        cache: false,//Not sure if this is needed
        //Path var must be a path realitive to ajax.php
        //Path must contain a trailing slash
        data:{path:$(element).data("images"), action: "getImagesFromDir"},
        type:"POST",
        timeout:ajaxTimeout,
        success: function(output){
          output = $.parseJSON(output);
          if(output['errorMsg'] !== undefined){
            console.log("Error has occured in ajax.php\nError Message: " + output['errorMsg']);
            suicidal = true;
          }else
            $(element).data("images", output);
        },
        
      });
    };
    function animate(addDelay){
      //addDelay: If true, the standard animation was interrupted by user, add delay
      // console.log('tOut: '+tOut);
      // console.log('addDelay: '+addDelay);
      var finalDelay = delay;
      $(element).stop(true, true);//Stop any current animations
      if(addDelay){//Reset and add delay if true
        clearTimeout(tOut);//reset the local timeout
        finalDelay = delay+changeDelay;//Delay is longer
      }
      tOut = setTimeout(function() {//Set tOut, if timeout concludes tOut = undefined
          if($(element).data("position")>=$(element).data("images").length-1){//Is current position all the way to the right?
            $(element).data("position", 0);
          }else{
            $(element).data("position", $(element).data("position")+1);
          }
          updateImage();
          animate(false);//Don't add delay because it finished normally
        }, finalDelay);
    };
    function resetDisabled(){
      $(element).find('.slider-link')
        .css({"background-color":"rgba(0,0,0, 0.25)",
          "border":"1px solid rgba(255,255,255, 0.25)"
        })
        .setDisabled(false);//Set all to !disabled
      $(element)
        .find('#slider-link-'+$(element).data("position")).css({
          "background-color":"#000",
          "border":"1px solid #FFF"
        })
        .setDisabled(true);//Set current position link to disabled
    };

    //Update Captions
    function updateCaption () {
      if(captions != null){
        var setCaption = "";
        if(typeof captions[$(element).data("position")] !== 'undefined'){
          setCaption = captions[$(element).data("position")];
        }
        $(element).find("#slider-captions-container").html(setCaption).css({"left":(w/2)-$(element).find("#slider-captions-container").width()/2});       
      }
    } 

    function updateImage(){
      //Disable current nav button
      resetDisabled();

      //Update Captions
      updateCaption();

      //Fade out and remove old banner
      var toRemove = $(element).find('.slider-image');//Set temp variable to target specific element
      $(toRemove).fadeOut(transition);//Fade element out
      var transitionTout = setTimeout(function() {//Set timeout to remove element after the animation
        $(toRemove).remove();
      }, transition*2);//Double transition time to make sure the element is hidden when removed

      //Create and fade in new banner
      $('<img />')
          .attr({
            'id':'slider-image-'+$(element).data("position"),
            'class':'slider-image','src':root+$(element).data("images")[$(element).data("position")],
            'alt':$(element).data("position"),
            'width':w,
            'height':h})
          .css({
            "position":"absolute",
            "top":0,
            "left":0,
            "z-index": -1
          })
          .appendTo(element)//attach)
          .hide()
          .fadeIn(transition);
    };
    function createNav(){
      //Add required container definitions
      $(element).data("position",0).html("").addClass('slider-container').css({'position':'relative', 'width':w, 'height':h});
      //Create first image (z-index doesn't need to bet set)
      $('<img />')
          .attr({'id':'slider-image-0','class':'slider-image','src':root+$(element).data("images")[$(element).data("position")],'alt':$(element).data("position"),'width':w,'height':h})
          .css({
            "position":"absolute",
            "top":0,
            "left":0
          })
          .appendTo(element);
      //Steps
      if(haveStep){
        //Create left button
        $('<button />')
          .attr({"id":"slider-left","class":"slider-nav slider-step"})
          .css({
            "position":"absolute",
            "top":h-stepSize-pad,
            "left":pad,
            "width":stepSize,
            "height":stepSize,
            "color":"#FFF",
            "font-size": 35,
            "background-color":"rgba(0,0,0,0.25)",
            "border":"none",
            "text-align":"center"
          })
          .html("&#9668;")
          .appendTo(element).hide();
        //Create Right button
        $('<button />')
          .attr({"id":"slider-right","class":"slider-nav slider-step"})
          .css({
            "position":"absolute",
            "top":h-stepSize-pad,
            "left":w-stepSize-pad,
            "width":stepSize,
            "height":stepSize,
            "color":"#FFF",
            "font-size": 35,
            "background-color":"rgba(0,0,0,0.25)",
            "border":"none",
            "text-align":"center"
          })
          .html("&#9658;")
          .appendTo(element).hide();
      }
      //Create captions container
      if(captions != null){
        $("<span />")
          .attr({
            "id":"slider-captions-container",
            "class":"slider-nav"
          })
          .css({
            "position":"absolute",
            "top":"90%",
            "color":"#FFF",
            "text-align":"center"
          })
          .appendTo(element).hide();
      }

      updateCaption();

      //Create link button container
      $("<div />")
        .attr({
          "id":"slider-link-container",
          "class":"slider-nav"
        })
        .css({
          "position":"absolute",
          "top":h-40,
          "left":(w*p)-((($(element).data("images").length * 20)+($(element).data("images").length * pad))),
          "padding":pad
        })
        .appendTo(element).hide();

      //Generate a link button for each image in the set
      if(haveLinks){
        for (var i = $(element).data("images").length - 1; i >= 0; i--) {
          $('<button />')
            .attr({
              "id":"slider-link-"+($(element).data("images").length-i-1),
              "class":"slider-link"
            })
            .data("target", ($(element).data("images").length-i-1))
            .html("&nbsp;")
            .appendTo($(element).find("#slider-link-container"));
        };
      }
    };
  };
  $.fn.setDisabled = function(t){
    return this.each(function(){
      this.disabled = t;
    });
  };
})(jQuery);