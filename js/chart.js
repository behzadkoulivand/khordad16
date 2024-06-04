
(function ($) {
  $.fn.orgChart = function (options) {
    var opts = $.extend({}, $.fn.orgChart.defaults, options);
    return new OrgChart($(this), opts);
  };

  $.fn.orgChart.defaults = {
    data: [{ id: 1, name: 'Root', title: 'Amount', parent: 0, hierarchy: 0 }],
    showControls: false,
    allowEdit: false,
    onAddNode: null,
    onDeleteNode: null,
    onClickNode: null,
    newNodeText: 'اضافه کردن',
    delNodeText: 'حذف' };


  function OrgChart($container, opts) {
    var data = opts.data;
    var nodes = {};
    var rootNodes = [];
    this.opts = opts;
    this.$container = $container;
    var self = this;

    this.draw = function () {
      $container.empty().append(rootNodes[0].render(opts));
      document.getElementsByClassName('org-del-button')[0].style.display = 'none';
      $container.find('.node').click(function () {
        if (self.opts.onClickNode !== null) {
          self.opts.onClickNode(nodes[$(this).attr('node-id')]);
        }
      });

      if (opts.allowEdit) {
        $container.find('.node h2').click(function (e) {
          var thisId = $(this).parent().attr('node-id');
          self.startEdit(thisId);
          e.stopPropagation();
        });
        $container.find('.node h3').click(function (e) {
          var thisId = $(this).parent().attr('node-id');
          self.startEdith3(thisId);
          e.stopPropagation();
        });
      }

      // add "add button" listener
      $container.find('.org-add-button').click(function (e) {
        var thisId = $(this).parent().attr('node-id');

        if (self.opts.onAddNode !== null) {
          self.opts.onAddNode(nodes[thisId]);
        } else
        {
          self.newNode(thisId);
        }
        e.stopPropagation();
      });

      $container.find('.org-del-button').click(function (e) {
        var thisId = $(this).parent().attr('node-id');

        if (self.opts.onDeleteNode !== null) {
          self.opts.onDeleteNode(nodes[thisId]);
        } else
        {
          self.deleteNode(thisId);
        }
        e.stopPropagation();
      });
    };

    this.startEdit = function (id) {
      var inputElement = $('<input class="org-input" type="text" value="' + nodes[id].data.name + '"/>');
      $container.find('div[node-id=' + id + '] h2').replaceWith(inputElement);
      var commitChange = function () {
        var h2Element = $('<h2>' + nodes[id].data.name + '</h2>');
        if (opts.allowEdit) {
          h2Element.click(function () {
            self.startEdit(id);
          });
        }
        inputElement.replaceWith(h2Element);
      };
      inputElement.focus();
      inputElement.keyup(function (event) {
        if (event.which == 13) {
          commitChange();
        } else
        {
          nodes[id].data.name = inputElement.val();
        }
      });
      inputElement.blur(function (event) {
        commitChange();
      });
    };

    //////////////////////title field//////////////////////////////
    this.startEdith3 = function (id) {
      var inputElement = $('<input class="org-input" type="text" value="' + nodes[id].data.title + '"/>');
      $container.find('div[node-id=' + id + '] h3').replaceWith(inputElement);
      var commitChange = function () {
        var h3Element = $('<h3>' + nodes[id].data.title + '</h3>');
        if (opts.allowEdit) {
          h3Element.click(function () {
            self.startEdith3(id);
          });
        }
        inputElement.replaceWith(h3Element);
      };
      inputElement.focus();
      inputElement.keyup(function (event) {
        if (event.which == 13) {
          commitChange();
        } else
        {
          nodes[id].data.title = inputElement.val();
        }
      });
      inputElement.blur(function (event) {
        commitChange();
      });
    };
    //////////////////////title field ends////////////////////////
    this.newNode = function (parentId) {
      var nextId = Object.keys(nodes).length;
      while (nextId in nodes) {if (window.CP.shouldStopExecution(0)) break;
        nextId++;
      }window.CP.exitedLoop(0);
      // self.addNode({ id: nextId, name: '(نام جدید)', title: 'کد جدید', hierarchy: parentId, parent: parentId });
      // saving(nextId, "kkk", "aja", parentId);
    };

    this.addNode = function (data) {
      var newNode = new Node(data);
      nodes[data.id] = newNode;
      nodes[data.parent].addChild(newNode);
      self.draw();
      self.startEdit(data.id);
      self.startEdith3(data.id);
    };

    this.deleteNode = function (id) {
      for (var i = 0; i < nodes[id].children.length; i++) {if (window.CP.shouldStopExecution(1)) break;
        self.deleteNode(nodes[id].children[i].data.id);
      }window.CP.exitedLoop(1);
      nodes[nodes[id].data.parent].removeChild(id);
      delete nodes[id];
      self.draw();
    };

    this.getData = function () {
      var outData = [];
      for (var i in nodes) {
        outData.push(nodes[i].data);
      }
      return outData;
    };

    // constructor
    for (var i in data) {
      var node = new Node(data[i]);
      nodes[data[i].id] = node;
    }

    // generate parent child tree
    for (var i in nodes) {
      if (nodes[i].data.parent == 0) {
        rootNodes.push(nodes[i]);
      } else
      {
        nodes[nodes[i].data.parent].addChild(nodes[i]);
      }
    }

    // draw org chart
    $container.addClass('orgChart');
    self.draw();
  }

  function Node(data) {
    this.data = data;
    this.children = [];
    var self = this;

    this.addChild = function (childNode) {
      this.children.push(childNode);
    };

    this.removeChild = function (id) {
      for (var i = 0; i < self.children.length; i++) {if (window.CP.shouldStopExecution(2)) break;
        if (self.children[i].data.id == id) {
          self.children.splice(i, 1);
          return;
        }
      }window.CP.exitedLoop(2);
    };

    this.render = function (opts) {
      var childLength = self.children.length,
      mainTable;

      mainTable = "<table cellpadding='0' cellspacing='0' border='0'>";
      var nodeColspan = childLength > 0 ? 2 * childLength : 2;
      mainTable += "<tr><td colspan='" + nodeColspan + "'>" + self.formatNode(opts) + "</td></tr>";

      if (childLength > 0) {
        var downLineTable = "<table cellpadding='0' cellspacing='0' border='0'><tr class='lines x'><td class='line left half'></td><td class='line right half'></td></table>";
        mainTable += "<tr class='lines'><td colspan='" + childLength * 2 + "'>" + downLineTable + '</td></tr>';

        var linesCols = '';
        for (var i = 0; i < childLength; i++) {if (window.CP.shouldStopExecution(3)) break;
          if (childLength == 1) {
            linesCols += "<td class='line left half'></td>"; // keep vertical lines aligned if there's only 1 child
          } else
          if (i == 0) {
            linesCols += "<td class='line left'></td>"; // the first cell doesn't have a line in the top
          } else
          {
            linesCols += "<td class='line left top'></td>";
          }

          if (childLength == 1) {
            linesCols += "<td class='line right half'></td>";
          } else
          if (i == childLength - 1) {
            linesCols += "<td class='line right'></td>";
          } else
          {
            linesCols += "<td class='line right top'></td>";
          }
        }window.CP.exitedLoop(3);
        mainTable += "<tr class='lines v'>" + linesCols + "</tr>";

        mainTable += "<tr>";
        for (var i in self.children) {
          mainTable += "<td colspan='2'>" + self.children[i].render(opts) + "</td>";
        }
        mainTable += "</tr>";
      }
      mainTable += '</table>';
      return mainTable;
    };

    this.formatNode = function (opts) {
      var nameString = '',
      descString = '';
      titleString = '';
      if (typeof data.name !== 'undefined') {
        nameString = '<h2>' + self.data.name + '</h2>';
      }
      if (typeof data.title !== 'undefined') {
        titleString = '<h3>' + self.data.title + '</h3>';
      }
      if (typeof data.description !== 'undefined') {
        descString = '<p>' + self.data.description + '</p>';
      }
      if (opts.showControls) {
        var buttonsHtml = "<div class='org-add-button'>" + opts.newNodeText + "</div><div class='org-del-button'>" + opts.delNodeText + "</div>";
      } else
      {
        buttonsHtml = '';
      }
      return "<div class='node' node-id='" + this.data.id + "'>" + nameString + titleString + descString + buttonsHtml + "</div>";
    };
  }

})(jQuery);

///////////////////////////////////////
// var testData = [
// { id: 1, name: 'ستاد کل', title: 'کد 1', parent: 0 },
// { id: 2, name: 'ارتش', title: 'کد 11', parent: 1 },
// { id: 3, name: 'سپاه', title: 'کد 12', parent: 1 },
// { id: 4, name: 'نیروی انتظامی', title: 'کد 13', parent: 1 },
// { id: 6, name: 'نیرو زمینی', title: 'کد 111', parent: 2 },
// { id: 7, name: 'نیرو هوایی', title: 'کد 112', parent: 2 },
// { id: 8, name: 'نیرو دریایی', title: 'کد 113', parent: 2 },
// { id: 5, name: 'ساحفاجا', title: 'کد 114', parent: 2 },
// { id: 9, name: 'عقدتی‌سیاسی', title: 'کد 115', parent: 2 },
// { id: 10, name: 'معاونت فنی', title: 'کد 1141', parent: 5 }
// ];

// const saving = (id, name, title, parent) => {
//   testData.push({id, name, title, parent});
// };

const dataChart = (Data)=>{
  return ($(function () {
    org_chart = $('#orgChart').orgChart({
      data: Data,
      showControls: true,
      allowEdit: false,
      onAddNode: function (node) {
        // log('Created new node on node ' + node.data.id);
        // org_chart.newNode(node.data.id);
        window.sessionStorage.nodeID = node.data.id;
        window.location.href = "/dashboard/add-chart"
      },
      onDeleteNode: function (node) {
        log('Deleted node ' + node.data.id);
        org_chart.deleteNode(node.data.id);
      },
      onClickNode: function (node) {
        log('Clicked node ' + node.data.id);
      } });
  
  
  }))
}

// just for example purpose
function log(text) {
  $('#consoleOutput').append('<p>' + text + '</p>');
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-36251023-1']);
_gaq.push(['_setDomainName', 'jqueryscript.net']);
_gaq.push(['_trackPageview']);

(function () {
  var ga = document.createElement('script');ga.type = 'text/javascript';ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(ga, s);
})();
//# sourceURL=pen.js
