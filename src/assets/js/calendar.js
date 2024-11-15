document.addEventListener('DOMContentLoaded', function () {
    // 모달 HTML 로드
    fetch('newEvent.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('modalContainer').innerHTML = html;
        });

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {

        // Tool Bar 목록 document : https://fullcalendar.io/docs/toolbar
        headerToolbar: {
            left: 'prevYear,prev,next,nextYear,today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },

        initialView: 'dayGridMonth',
        selectable: true,
        selectMirror: true,
        locale: 'ko',
        navLinks: true,
        editable: true,
        height: '100%',
        aspectRatio: 1.8,
        dayMaxEvents: true,

        dayCellDidMount: function (arg) {
            arg.el.style.padding = '2px';
            arg.el.style.height = 'auto';
        },
        dayCellContent: function (arg) {
            arg.dayNumberText = arg.date.getDate(); // 날짜를 숫자로만 표시
        },

        select: function (arg) {
            const modal = document.getElementById('eventModal');
            const form = document.getElementById('eventForm');
            const closeButton = document.querySelector('.close-button');

            // 시작 시간 설정
            const startDate = arg.start;
            // 종료 시간을 시작 시간 + 1시간으로 설정
            const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));

            document.getElementById('eventStart').value = startDate.toISOString().slice(0, 16);
            document.getElementById('eventEnd').value = endDate.toISOString().slice(0, 16);

            modal.style.display = "block";

            form.onsubmit = function (e) {
                e.preventDefault();

                calendar.addEvent({
                    title: document.getElementById('eventTitle').value,
                    start: document.getElementById('eventStart').value,
                    end: document.getElementById('eventEnd').value,
                    location: document.getElementById('eventLocation').value,
                    description: document.getElementById('eventDescription').value,
                    color: document.getElementById('eventColor').value,
                    extendedProps: {
                        calendar: document.getElementById('eventCalendar').value,
                        reminder: document.getElementById('eventReminder').value,
                        attendees: document.getElementById('eventAttendees').value
                    }
                });

                modal.style.display = "none";
                form.reset();
                calendar.unselect();
            };

            document.querySelector('.btn-cancel').onclick = function () {
                modal.style.display = "none";
                form.reset();
                calendar.unselect();
            };

            // 닫기 버튼 이벤트 추가
            closeButton.onclick = function () {
                modal.style.display = "none";
                form.reset();
                calendar.unselect();
            };

            // ESC 키로 모달 닫기
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    form.reset();
                    calendar.unselect();
                }
            };
        },

        // 날짜 클릭 이벤트 추가
        dateClick: function (info) {
            const modal = document.getElementById('eventModal');
            const form = document.getElementById('eventForm');
            const closeButton = document.querySelector('.close-button');

            // 시작 시간 설정
            const startDate = info.date;
            // 종료 시간을 시작 시간 + 1시간으로 설정
            const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));

            document.getElementById('eventStart').value = startDate.toISOString().slice(0, 16);
            document.getElementById('eventEnd').value = endDate.toISOString().slice(0, 16);

            modal.style.display = "block";

            // 모달 닫기 이벤트 핸들러들
            form.onsubmit = function (e) {
                e.preventDefault();

                calendar.addEvent({
                    title: document.getElementById('eventTitle').value,
                    start: document.getElementById('eventStart').value,
                    end: document.getElementById('eventEnd').value,
                    location: document.getElementById('eventLocation').value,
                    description: document.getElementById('eventDescription').value,
                    color: document.getElementById('eventColor').value,
                    extendedProps: {
                        calendar: document.getElementById('eventCalendar').value,
                        reminder: document.getElementById('eventReminder').value,
                        attendees: document.getElementById('eventAttendees').value
                    }
                });

                modal.style.display = "none";
                form.reset();
            };

            document.querySelector('.btn-cancel').onclick = function () {
                modal.style.display = "none";
                form.reset();
            };

            closeButton.onclick = function () {
                modal.style.display = "none";
                form.reset();
            };

            // 모달 외부 클릭 시 닫기
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    form.reset();
                }
            };
        },

        // 이전의 eventClick 핸들러를 제거하고 다음으로 교체
        eventClick: function (info) {
            // 구글 캘린더 이벤트인 경우 처리
            if (info.event.source && info.event.source.googleCalendarId) {
                info.jsEvent.preventDefault();
                return;
            }

            // 일반 이벤트인 경우 수정 모달 표시
            const editModal = document.getElementById('editEventModal');
            const form = document.getElementById('editEventForm');
            const closeButton = editModal.querySelector('.close-button');
            const event = info.event;

            // 폼에 현재 이벤트 정보 채우기
            document.getElementById('editEventTitle').value = event.title;
            document.getElementById('editEventLocation').value = event.extendedProps.location || '';
            document.getElementById('editEventStart').value = new Date(event.start.getTime() - (event.start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            document.getElementById('editEventEnd').value = event.end ? new Date(event.end.getTime() - (event.end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
            document.getElementById('editEventAttendees').value = event.extendedProps.attendees || '';
            document.getElementById('editEventCalendar').value = event.extendedProps.calendar || 'default';
            document.getElementById('editEventDescription').value = event.extendedProps.description || '';
            document.getElementById('editEventReminder').value = event.extendedProps.reminder || '0';
            document.getElementById('editEventColor').value = event.backgroundColor || 'red';

            editModal.style.display = "block";

            // 수정 폼 제출 처리
            form.onsubmit = function (e) {
                e.preventDefault();

                // 이벤트 업데이트
                event.setProp('title', document.getElementById('editEventTitle').value);
                event.setStart(document.getElementById('editEventStart').value);
                event.setEnd(document.getElementById('editEventEnd').value);
                event.setExtendedProp('location', document.getElementById('editEventLocation').value);
                event.setExtendedProp('description', document.getElementById('editEventDescription').value);
                event.setExtendedProp('calendar', document.getElementById('editEventCalendar').value);
                event.setExtendedProp('reminder', document.getElementById('editEventReminder').value);
                event.setExtendedProp('attendees', document.getElementById('editEventAttendees').value);
                event.setProp('backgroundColor', document.getElementById('editEventColor').value);

                editModal.style.display = "none";
                form.reset();
            };

            // 삭제 버튼 처리
            document.querySelector('.btn-delete').onclick = function () {
                if (confirm('이벤트를 삭제하시겠습니까?')) {
                    event.remove();
                    editModal.style.display = "none";
                    form.reset();
                }
            };

            // 취소 버튼 처리
            document.querySelector('#editEventModal .btn-cancel').onclick = function () {
                editModal.style.display = "none";
                form.reset();
            };

            // 닫기 버튼 처리
            closeButton.onclick = function () {
                editModal.style.display = "none";
                form.reset();
            };

            // 모달 외부 클릭 시 닫기
            window.onclick = function (event) {
                if (event.target == editModal) {
                    editModal.style.display = "none";
                    form.reset();
                }
            };
        },
        dayMaxEvents: true,
        events: [

        ],

        // 구글 캘린더 연동을 위한 부분
        googleCalendarApiKey: 'AIzaSyDW7AWvIQ-PRfNCHF3l8mw0LD2rK17LDLo',
        eventSources: [
            {
                // 한국의 공휴일 캘린더를 따와서 표시
                googleCalendarId: 'ko.south_korea#holiday@group.v.calendar.google.com',
                color: 'white',
                textColor: 'red',
                className: 'holiday-event'
            }
        ],

        // 이벤트 표시 방식 커스터마이징
        eventContent: function (arg) {
            return {
                html: '<div class="fc-event-title">' + arg.event.title + '</div>'
            };
        },
    });

    calendar.render();
});

