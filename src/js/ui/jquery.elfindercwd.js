$.fn.elfindercwd = function(fm) {
	// var ui = fm.ui;
	
	var tpl = {
			icons : {
				container : '%content',
				file : '<div id="%hash" class="elfinder-cwd-file %permsclass %dirclass ui-corner-all">'
						+'<div class="elfinder-cwd-file-wrapper ui-corner-all">'
						+'<div class="elfinder-cwd-icon %mime ui-corner-all"/>%marker'
						+'</div>'
						+'<div class="elfinder-cwd-filename ui-corner-all">%name</div>'
						+'</div>'
			},
			list : {
				container : '<table><thead><tr><td class="ui-widget-header">'+fm.i18n('Name')+'</td><td class="ui-widget-header">'+fm.i18n('Permissions')+'</td><td class="ui-widget-header">'+fm.i18n('Modified')+'</td><td class="ui-widget-header">'+fm.i18n('Size')+'</td><td class="ui-widget-header">'+fm.i18n('Kind')+'</td></tr></thead><tbody>%content</tbody></table>',
				file : '<tr id="%hash" class="elfinder-file %permsclass %dirclass %oddclass">'
						+'<td><div class="elfinder-cwd-file-wrapper"><span class="elfinder-cwd-icon %mime"/>%marker<span class="elfinder-filename">%name</span></div></td>'
						+'<td>%perms</td>'
						+'<td>%date</td>'
						+'<td>%size</td>'
						+'<td>%kind</td>'
						+'</tr>'
			}
		},
		replace = {
			permsclass : function(f) {
				return fm.ui.perms2class(f);
			},
			perms : function(f) {
				return fm.ui.formatPermissions(f);
			},
			dirclass : function(f) {
				return f.mime == 'directory' ? 'directory' : '';
			},
			mime : function(f) {
				return fm.ui.mime2class(f.mime);
			},
			size : function(f) {
				return fm.ui.formatSize(f.size);
			},
			date : function(f) {
				return fm.ui.formatDate(f.date);
			},
			kind : function(f) {
				return fm.ui.mime2kind(f.mime);
			},
			marker : function(f) {
				return (f.link || f.mime == 'symlink-broken' ? '<span class="elfinder-symlink"/>' : '')+(!f.read || !f.write ? '<span class="elfinder-perms"/>' : '');
			},
			oddclass : function(f, i) {
				return i%2 ? 'elfinder-odd-row' : '';
			}
		}
	
	
	return this.each(function() {
		var cwd = $(this).addClass('elfinder-cwd');
		
		cwd.delegate('[id]', 'select.elfinder', function(e) {
			var id = $(this).addClass('ui-selected').children().addClass('ui-state-hover').end().attr('id');
			
			if ($.inArray(id, fm.selected) === -1) {
				fm.selected.push(id);
			}
		})
		.delegate('[id]', 'unselect.elfinder', function(e) {
			var id = $(this).removeClass('ui-selected').children().removeClass('ui-state-hover').end().attr('id'),
				ndx = $.inArray(id, fm.selected);
			
			if (ndx !== -1) {
				fm.selected.splice(ndx, 1)
			}
		})
		
		cwd.selectable({
			filter : '[id]',
			start  : function() { fm.trigger('focus'); },
			stop   : function() { fm.trigger('select'); },
			selected : function(e, ui) {
				// fm.log(ui)
				$(ui.selected).trigger('select.elfinder')
			},
			unselected : function(e, ui) {
				$(ui.unselected).trigger('unselect.elfinder')
			}
		})
		
		
		fm.bind('cd', function(e) {
			var list = fm.view == 'list',
				t = tpl[fm.view] || tpl.icons,
				html = '',
				i, f;

			fm.time('cwd')
			for (i = 0; i < e.data.cdc.length; i++) {
				f = e.data.cdc[i];
				if (f && f.name && f.hash) {
					html += t.file.replace(/%([a-z]+)/g, function(s, e) { return replace[e] ? replace[e](f, i) : f[e] });
				}
			}

			cwd.removeClass('elfinder-cwd-view-icons elfinder-cwd-view-list')
				.addClass('elfinder-cwd-view-'+(list ? 'list' :'icons'))
				.html(t.container.replace('%content', html));
			fm.timeEnd('cwd')
			fm.time('cwd-events')
			cwd.find(list ? '[id]' : '.elfinder-cwd-icon,.elfinder-cwd-filename')
				.draggable({
					addClasses : false,
					delay : 20,
					appendTo : cwd,
					revert : true,
					start : function() {
						var p = this.id ? $(this) : $(this).parents('[id]:first');
						if (!p.is('.ui-selected')) {
							p.trigger('select.elfinder')
						}
						// fm.log(p)
					},
					helper : function() {
						var h = $('<div class="elfinder-drag-helper"/>')
						fm.log('helper')
						return h
					}
				})
				.click(function(e) {
					var p = this.id ? $(this) : $(this).parents('[id]:first'), 
						m = $.browser.mozilla, 
						prev, next, id, s, f;
				
				
					if (e.shiftKey) {
						prev = p.prevAll('.ui-selected:first');
						next = p.nextAll('.ui-selected:first');
						if (next.length && !prev.length) {
							f = 'nextUntil';
							id = next.attr('id')
						} else {
							id = prev.attr('id');
							f = 'prevUntil'
						}
						p[f](m ? '[id="'+id+'"]' : '#'+id).add(p).trigger('select.elfinder');
					} else if (e.ctrlKey || e.metaKey) {
						p.trigger((p.is('.ui-selected') ? 'unselect' : 'select') + '.elfinder');
					} else {
						cwd.find('[id].ui-selected').trigger('unselect.elfinder');
						p.trigger('select.elfinder')
					}
				
					fm.trigger('focus').trigger('select');
					
				});
				
			cwd.find('.directory:not(.elfinder-na,.elfinder-ro)').droppable({
				tolerance : 'pointer',
				over : function() {
					$(this).find('.elfinder-cwd-icon').addClass('elfinder-cwd-icon-directory-opened')
				},
				out : function() {
					$(this).find('.elfinder-cwd-icon').removeClass('elfinder-cwd-icon-directory-opened')
				}
			})
			fm.timeEnd('cwd-events')
			
		})
		
	})
	
}