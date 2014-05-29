(function($) {
	var CalendarConfig;
	var DOC = $(document.body),
		//0/*@cc_on+1@*/ , !+'\v1' , !-[1,]
		IE6 = !-[1, ] && !window.XMLHttpRequest; //!-[1,]在IE9中就已经失效

	/**
	 * 创建日历构造函数
	 *
	 * @class   Calendar
	 * @param   {Object} config 配置对象
	 */
	var Calendar = function() {
		this.init.apply(this, arguments);
	};

	Calendar.prototype = {
		constructor: Calendar,
		//节日中文
		holidayNames: {
			"today": "今天",
			"yuandan": "元旦",
			"chuxi": "除夕",
			"chunjie": "春节",
			"yuanxiao": "元宵节",
			"qingming": "清明",
			"wuyi": "劳动节",
			"duanwu": "端午节",
			"zhongqiu": "中秋节",
			"guoqing": "国庆节"
		},
		//节日日期
		Holidays: {
			yuandan: ["2013-01-01", "2014-01-01", "2015-01-01"],
			chuxi: ["2013-02-09", "2014-01-30", "2015-02-18"],
			chunjie: ["2013-02-10", "2014-01-31", "2015-02-19"],
			yuanxiao: ["2013-02-24", "2014-2-14", "2015-03-05"],
			qingming: ["2013-04-04", "2014-04-05", "2015-04-05"],
			wuyi: ["2013-05-01", "2014-05-01", "2015-05-01"],
			duanwu: ["2013-06-12", "2014-06-02", "2015-06-20"],
			zhongqiu: ["2013-09-19", "2014-09-08", "2015-09-27"],
			guoqing: ["2013-10-01", "2014-10-01", "2015-10-01"]
		},
		//初始化
		init: function(config) {
			$.extend(this, config);
			this._render();
		},
		//渲染 
		_render: function() {
			this.box.find('.calendar').remove();
			this.box.append(this._dateTemplate());
			this._iframeMask();
			this.boundingBox = this.box.find('.calendar-bounding-box');
			this.container = this.box.find('.calendar').css({
				top: this.box.height()
			});
			this._input = this.box.find(".J_Item");
			this._delegate();
		},
		_iframeMask: function() {
			if (!IE6) return;
			var iframe = $('<iframe></iframe>', {
				"width": this.container.width(),
				"height": this.container.height(),
				"position": "absolute",
				"left": 0,
				"top": 0
			}).appendTo(this.container);
		},
		//绑定
		_delegate: function() {
			//绑定日期事件
			this.box.find
			this.boundingBox.delegate(".delegate_click", 'click', $.proxy(this.clickFn, this));
			this.boundingBox.delegate('.selectClass', 'change', $.proxy(this.changeFn, this));
			this._input.on("click", $.proxy(this.show, this));
			return this;
		},
		//date模版
		_dateTemplate: function() {
			var date = this.date,
				iYear = date.getFullYear(),
				iMonth = date.getMonth(),
				date_template = '';
			var inner = [];
			//插入箭头模版
			inner.push('<div class="calendar" >');
			inner.push('<div class="calendar-bounding-box">');
			inner.push('<div class="container"><div class="content-box">');
			inner.push(this._arrowTemplate());
			inner.push('<div class="date-box"><div class="inner">');
			//插入选择日历模版
			inner.push(this._selectTemplate());
			//插入主日历模版
			inner.push(this._tableTemplate(new Date(iYear, iMonth)));
			inner.push('</div></div></div></div></div></div>');
			return inner.join("");
		},
		//按钮模版
		_arrowTemplate: function() {
			var oArrow = [];
			oArrow.push('<div class="arrow">');
			oArrow.push('<span class="close-btn delegate_click" title="关闭">close</span>');
			oArrow.push('<span class="prev-btn delegate_click" title="上月">prev</span>');
			oArrow.push('<span class="next-btn delegate_click" title="下月">next</span>');
			oArrow.push('</div>');
			return oArrow.join("");
		},
		//返回日立星期头
		_weekTemplate: function() {
			var weekdays = [{
				name: '日',
				wClass: 'weekend'
			}, {
				name: '一'
			}, {
				name: '二'
			}, {
				name: '三'
			}, {
				name: '四'
			}, {
				name: '五'
			}, {
				name: '六',
				wClass: 'weekend'
			}];
			var week_template = [];
			week_template.push("<thead><tr>");
			for (var i = 0, len = weekdays.length; i < len; i++) {
				week_template.push('<th class="' + (weekdays[i].wClass || "") + '">' + weekdays[i].name + '</th>');
			}
			week_template.push("</tr></thead>");
			return week_template.join("");
		},
		//返回月日历
		_tableTemplate: function(date) {
			var iYear = date.getFullYear(),
				iMonth = date.getMonth() + 1,
				firstDays = new Date(iYear, iMonth - 1, 1).getDay(),
				monthDays = new Date(iYear, iMonth, 0).getDate(),
				rows, body_template = [],
				days_array = [],
				days, date, dayClass, holidayClass, dateStatus;
			//当前月的第一天星期几 得出空位
			for (; firstDays--;) days_array.push(0);
			//取得当前月份的天数
			for (var i = 1; i <= monthDays; i++) days_array.push(i);
			days_array.length = this._toDays();
			//获得行数
			rows = Math.ceil(days_array.length / 7);
			body_template.push("<table>");
			body_template.push(this._weekTemplate());
			body_template.push("<tbody>");
			for (var i = 0; i < rows; i++) {
				body_template.push('<tr>');
				for (var j = 0; j <= 6; j++) {
					//星期1到星期日 空出上个月的占位
					days = days_array[j + 7 * i] || '';
					//当前月的每一个天字符串
					date = days ? iYear + '-' + this._double(iMonth) + '-' + this._double(days) : '';
					//限定状态 boolean
					dateStatus = this._toDayStatus(date);
					//每一天的class
					dayClass = dateStatus || !days ? 'disabled' : "delegate_click";
					//获取节假日的class  (每一天的限定状态 || 是否空位)
					holidayClass = this._toDayClass(date, dateStatus || !days);
					body_template.push('<td data-date="' + date + '" class="' + dayClass + '">');
					body_template.push('<a href="javascript:;" class="' + holidayClass + '">' + days + '</a>');
					body_template.push('</td>');
				}
				body_template.push('</tr>');
			}
			body_template.push("</tbody>");
			body_template.push("</table>");
			return body_template.join("");
		},
		//获取星期几
		_toWeek: function(v) {
			return '星期' + ['日', '一', '二', '三', '四', '五', '六'][this._toDate(v).getDay()];
		},
		//将日期字符串转换成日期对象
		_toDate: function(v) {
			v = v.split(/-|\//g);
			return new Date(v[0], v[1] - 1, v[2]);
		},
		//返回非日期、非节日、当前（今天）、节日的a.className
		_toDayClass: function(v, b) {
			var Holidays = this.Holidays,
				date = this._toStringDate(new Date());
			switch (true) {
				case b:
				case !this.isHoliday:
					return '';
				case v == date:
					return 'today';
				case true:
					for (var property in Holidays) {
						if ($.inArray(v, Holidays[property]) != -1) {
							return property;
						}
					}
				default:
					return '';
			}
		},
		//日期转字符串
		_toStringDate: function(v) {
			return v.getFullYear() + '-' + this._double(v.getMonth() * 1 + 1) + '-' + this._double(v.getDate());
		},
		//日期格式化程数字
		_toNumber: function(v) {
			return v.toString().replace(/-|\//g, '')
		},
		//补0方法
		_double: function(v) {
			return v.toString().replace(/^(\d)$/, '0$1');
		},
		//返回限制日期的状态 转成数字比对大小
		_toDayStatus: function(v) {
			var v = this._toNumber(v),
				minDate = this.minDate,
				maxDate = this.maxDate;
			return (minDate && v < this._toNumber(minDate) || maxDate && v > this._toNumber(maxDate));
		},
		//算出所需的单元格
		_toDays: function() {
			var oDate = this.date,
				iYear = oDate.getFullYear(),
				iMonth = oDate.getMonth() + 1;
			return (new Date(iYear, iMonth - 1, 1).getDay() + new Date(iYear, iMonth * 1, 0).getDate());
		},
		//日期选择的select模版
		_selectTemplate: function() {
			var curDate = this.date,
				curYear = curDate.getFullYear(),
				curMonth = this._double(curDate.getMonth() * 1 + 1),
				minYear = 1900,
				maxYear = new Date().getFullYear() + 3;
			var select_template = [],
				_double_i;
			select_template.push('<h4><select class="selectClass">');
			//年份从大到小 月份从小到大
			for (var i = maxYear; i >= minYear; i--) {
				_double_i = this._double(i);
				select_template.push('<option' + (curYear == i ? ' selected="selected"' : '') +
					' value="' + _double_i + '">' + _double_i + '</option>');
			};
			select_template.push('</select>\u5e74<select class="selectClass">');
			for (var i = 1; i <= 12; i++) {
				_double_i = this._double(i);
				select_template.push('<option' + (curMonth == i ? ' selected="selected"' : '') +
					' value="' + _double_i + '">' + _double_i + '</option>');
			}
			select_template.push('</select>\u6708</h4>');
			return select_template.join("");
		},
		hide: function() {
			this.box.find(".calendar").hide();
		},
		show: function() {
			var calendar = this.box.find(".calendar");
			calendar.length && calendar.show();
		},
		prevMonth: function() {
			var date = this.date;
			var iMonth = this.date.getMonth(),
				iYear = this.date.getFullYear(),
				nDate;
			iMonth = iMonth == 0 ? (--iYear, 11) : iMonth - 1;
			this.date = new Date(iYear, iMonth, 1);
			this._render();
		},
		nextMonth: function() {
			var date = this.date;
			var iMonth = this.date.getMonth(),
				iYear = this.date.getFullYear(),
				nDate;
			iMonth = iMonth == 11 ? (++iYear, 0) : iMonth + 1;
			this.date = new Date(iYear, iMonth, 1);
			this._render();
		},
		clickFn: function(e) {
			var target = $(e.currentTarget),
				date = target.attr('data-date');
			switch (true) {
				case target.hasClass('prev-btn'):
					this.prevMonth();
					break;
				case target.hasClass('next-btn'):
					this.nextMonth();
					break;
				case target.hasClass('close-btn'):
					this.hide();
					break;
				case !!target.attr('data-date') && !target.hasClass('disabled'):
					this.hide();
					this.box.find("input").val(target.attr('data-date'));
					break;
			};
		},
		changeFn: function(e) {
			var selectList = this.boundingBox.find('.selectClass');
			this.date = new Date(selectList.eq(0).val(), selectList.eq(1).val() - 1, '1');
			this._render();
		}
	}


	$.fn.Calendar = function(opt) {
		return this.each(function() {
			new Calendar($.extend(opt, {
				box: $(this)
			}));
		})
	}
})(jQuery);