angular.module('linkify', []);

angular.module('linkify')
  .filter('linkify', function () {
      'use strict';
      // add protocol for url without specified protocol
      function add_protocol (url) {
        if(/(([\w]+:)?\/\/)/ig.test(url) === false) {
            url = 'http://' + url;
        }
        return url;
      }

      // for email link, add 'mailto:'
      function link_email (email) {
          var wrap = document.createElement('div');
          var anch = document.createElement('a');
          anch.href = 'mailto:' + email;
          anch.target = '_blank';
          anch.innerHTML = email;
          wrap.appendChild(anch);
          return wrap.innerHTML;
      }

      function linkify (_str, type) {
        if (!_str) {
          return;
        }
        
        var _text = _str.replace( /(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?/ig, function(url) {
            var wrap = document.createElement('div');
            var anch = document.createElement('a');
            anch.href = add_protocol(url);
            anch.target = '_blank';
            anch.innerHTML = url;
            wrap.appendChild(anch);
            return wrap.innerHTML;
        });
  
        // replace email url
        // 1=> first part of email address  3=> third part of email after the '@'
        //  111111111111111111111111111    333333333
        if(/([\w-.!#$%&'*+=/=?^_`{|}~]+)@((?:\w+\.)+)(?:[a-zA-Z]{2,4})/ig.test(_str)) {
            _text = _str.replace(/([\w-.!#$%&'*+=/=?^_`{|}~]+)@((?:\w+\.)+)(?:[a-zA-Z]{2,4})/ig,
                function (email) {
                    return link_email(email);
                }
            );
        }
        
        // bugfix
        if (!_text) {
          return '';
        }
        
        // Twitter
        if (type === 'twitter') {
          _text = _text.replace(/(|\s)*@(\w+)/g, '$1<a href="https://twitter.com/$2" target="_blank">@$2</a>');
          _text = _text.replace(/(^|\s)*#(\w+)/g, '$1<a href="https://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
        }
        
        // Github
        if (type === 'github') {
          _text = _text.replace(/(|\s)*@(\w+)/g, '$1<a href="https://github.com/$2" target="_blank">@$2</a>');
        }
        
        return _text;
      }
      
      //
      return function (text, type) {
        return linkify(text, type);
      };
  })
  .factory('linkify', ['$filter', function ($filter) {
    'use strict';
    
    function _linkifyAsType (type) {
      return function (str) {(type, str);
        return $filter('linkify')(str, type);
      };
    }
    
    return {
      twitter: _linkifyAsType('twitter'),
      github: _linkifyAsType('github'),
      normal: _linkifyAsType()
    };
  }])
  .directive('linkify', ['$filter', '$timeout', 'linkify', function ($filter, $timeout, linkify) {
    'use strict';
    
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var type = attrs.linkify || 'normal';
        $timeout(function () { element.html(linkify[type](element.html())); });
      }
    };
  }]);

