var loadImage = function ($image, src, cbFn) {
    $image.bind('load', function(evt) {
        $image.unbind('load');
        cbFn($image);
    }).each(function() {
        if ($image[0].complete) {
            $image.trigger('load');
        }
    });
    if (/webkit/.test(navigator.userAgent.toLowerCase())) {
        $image.attr('src', '');
    }
    $image.attr('src', src);
}, createItem = function($image, angle, options) {
    var loaded = false,
        orgWidth, orgHeight,
        $orgDiv,
        sizeRange,
        that;
    sizeRange = (1 - options.minScale) * 0.5;
    $image.css({
        opacity: 0,
        position: 'absolute'
    });

    $orgDiv = $image.wrap('<div style="position:absolute;">').parent();
    that = {
        update: function(ang) {
            var sinVal, scale, x, y;
            ang += angle;
            sinVal = Math.sin(ang);
            scale = (sinVal + 1) * sizeRange + options.minScale;

            x = Math.cos(ang) * options.radiusX * scale + options.width / 2;
            y = sinVal * options.radiusY * scale + options.height / 2;

            $orgDiv.css({
                left: (x >> 0) + 'px',
                top: (y >> 0) + 'px',
                zIndex: (scale * 100) >> 0
            });

            if (loaded) {
                $image.css({
                    width: (orgWidth * scale) + 'px',
                    height: (orgHeight * scale) + 'px',
                    top: (-orgHeight * scale) / 2 + 'px',
                    left: (-orgWidth * scale) / 2 + 'px'
                });
            }
        }
    };
    loadImage($image, $image.attr('src'), function($image) {
        loaded = true;
        orgWidth = $image.width();
        orgHeight = $image.height();
        $image.animate({
            opacity: 1
        }, 1000);
    })
    return that;
}, createCarousel = function($wrap, options) {
    var items = [],
        rot = 0,
        pause = false,
        unpauseTimeout = 0,
        rotAmount = (Math.PI * 2) * (options.frameRate / options.rotRate),
        $images = $('img', $wrap),
        spacing = (Math.PI / $images.length) * 2,
        angle = Math.PI / 2,
        i, image, item;
    $wrap.bind('mouseover mouseout', function(evt) {
        if (!$(evt.target).is('img')) {
            return;
        }
        if (evt.type === 'mouseover') {
            clearTimeout(unpauseTimeout);
            pause = true;
        } else {
            unpauseTimeout = setTimeout(function() {
                pause = false;
            }, 200);
        }
    });
    for (i = 0; i < $images.length; i++) {
        image = $images[i];
        item = createItem($(image), angle, options);
        items.push(item);
        angle += spacing;
    }
    setInterval(function() {
        if (!pause) {
            rot += rotAmount;
        }
        for (i = 0; i < items.length; i++) {
            items[i].update(rot);
        }
    }, options.frameRate);
};

$.fn.Carousel = function(options) {
    this.each(function() {
        options = $.extend({}, $.fn.Carousel.defaults, options);
        $(this).css({
            position: 'relative',
            width: options.width + 'px',
            height: options.height + 'px'
        });
        createCarousel($(this), options);
    });
};

$.fn.Carousel.defaults = {
    radiusX: 230,
    radiusY: 80,
    width: 512,
    height: 300,
    frameRate: 20,
    rotRate: 5000,
    minScale: 0.60
};