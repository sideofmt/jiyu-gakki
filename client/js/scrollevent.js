var Scroll_Event = function(){
        
    //スクロール禁止用関数
    var scroll_event = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
    $(document).on(scroll_event,function(e){e.preventDefault();});
    document.body.style.overflow = "hidden";
    
    $(window).on('touchmove.noScroll', function(e) {
        e.preventDefault();
    });
    
	$(function(){
		$('a').click(function(){
			location.href = $(this).attr('href');
			return false;
		});
	});
	
};