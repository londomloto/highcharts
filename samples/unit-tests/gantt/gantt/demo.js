var defaultChartConfig,
    getSpacing = function (chart) {
        var yAxis = chart.yAxis[0],
            tickIdx = yAxis.tickPositions,
            ticks = yAxis.ticks,
            tick1 = ticks[tickIdx[0]].mark.getBBox().y,
            tick2 = ticks[tickIdx[1]].mark.getBBox().y;

        return tick1 - tick2;
    };

QUnit.testStart(function () {
    defaultChartConfig = {
        title: {
            text: 'Projects'
        },
        series: [{
            name: 'Project 1',
            borderRadius: 10,
            data: [{
                id: 'start_prototype',
                start: Date.UTC(2014, 10, 18),
                end: Date.UTC(2014, 10, 25),
                taskGroup: 'Start prototype',
                taskName: 'Start prototype',
                y: 0,
                partialFill: 0.25
            }, {
                id: 'prototype_done',
                start: Date.UTC(2014, 10, 25, 12),
                milestone: true,
                taskName: 'Prototype done',
                taskGroup: 'Prototype done',
                y: 1
            }, {
                id: 'test_prototype',
                start: Date.UTC(2014, 10, 27),
                end: Date.UTC(2014, 10, 28),
                taskName: 'Test prototype',
                taskGroup: 'Test prototype',
                y: 2
            }, {
                id: 'development',
                start: Date.UTC(2014, 10, 20),
                end: Date.UTC(2014, 10, 25),
                taskGroup: 'Develop',
                taskName: 'Develop',
                y: 3,
                partialFill: 0.12
            }, {
                id: 'unit_tests',
                start: Date.UTC(2014, 10, 20),
                end: Date.UTC(2014, 10, 22),
                y: 4,
                parent: 'development',
                taskGroup: 'Create unit tests',
                taskName: 'Create unit tests',
                partialFill: {
                    amount: 0.5,
                    fill: '#fa0'
                }
            }, {
                id: 'implement',
                start: Date.UTC(2014, 10, 22),
                end: Date.UTC(2014, 10, 25),
                y: 5,
                taskGroup: 'Implement',
                parent: 'development',
                taskName: 'Implement'
            }, {
                id: 'acceptance_tests',
                start: Date.UTC(2014, 10, 23),
                end: Date.UTC(2014, 10, 26),
                taskName: 'Run acceptance tests',
                taskGroup: 'Run acceptance tests',
                y: 6
            }]
        }]
    };
});

/**
 * Checks that milestones are drawn differently than tasks
 */
QUnit.test('Milestones', function (assert) {
    var chart = Highcharts.ganttChart('container', defaultChartConfig),
        points = chart.series[0].points,
        taskPoint = points[0],
        milestonePoint = points[1],
        milestone = milestonePoint.graphic,
        path,
        isDiamond,
        topX,
        topY,
        rightX,
        rightY,
        bottomX,
        bottomY,
        leftX,
        leftY,
        height,
        width,
        floatError = 0.00001;

    assert.equal(
        taskPoint.milestone,
        undefined,
        'Point with no miliestone:true is not a milestone'
    );

    assert.equal(
        milestonePoint.milestone,
        true,
        'Point with milestone:true is a milestone'
    );

    assert.equal(
        typeof milestone.d,
        'string',
        'Milestone has a \'d\' value'
    );

    // Remove path letters
    path = milestone.d.replace(/[a-zA-Z]/g, '');
    // Replace sequences of space characters with single spaces
    path = path.replace(/\s+/g, ' ');
    // Remove surrounding spaces
    path = path.trim();
    // Split on spaces to create an array
    path = path.split(' ');

    topX = parseFloat(path[0]);
    topY = parseFloat(path[1]);
    rightX = parseFloat(path[2]);
    rightY = parseFloat(path[3]);
    bottomX = parseFloat(path[4]);
    bottomY = parseFloat(path[5]);
    leftX = parseFloat(path[6]);
    leftY = parseFloat(path[7]);

    height = bottomY - topY;
    width = rightX - leftX;

    // The path is a diamond if:
    // 1. The top and bottom x values are aligned
    // 2. The left and right y values are aligned
    // 3. The width and height are the same
    // 4. The path has only 4 vectors
    isDiamond = topX === bottomX &&
                leftY === rightY &&
                Math.abs(width - height) < floatError;

    assert.ok(
        isDiamond,
        'Milestone path is a diamond'
    );
});

QUnit.test('Axis breaks and staticScale', function (assert) {
    var today = new Date(),
        day = 1000 * 60 * 60 * 24,
        spaceExpanded,
        spaceCollapsed,
        chart,
        evObj;

    // Set to 00:00:00:000 today
    today.setUTCHours(0);
    today.setUTCMinutes(0);
    today.setUTCSeconds(0);
    today.setUTCMilliseconds(0);
    today = today.getTime();

    chart = Highcharts.ganttChart('container', {
        title: {
            text: 'Gantt Chart Test'
        },
        xAxis: {
            currentDateIndicator: true,
            min: today - 3 * day,
            max: today + 18 * day
        },

        chart: {
            animation: false
        },

        plotOptions: {
            series: {
                animation: false
            }
        },

        series: [{
            name: 'Offices',
            data: [{
                taskName: 'New offices',
                id: 'new_offices',
                start: today - 2 * day,
                end: today + 14 * day
            }, {
                taskName: 'Prepare office building',
                id: 'prepare_building',
                parent: 'new_offices',
                start: today - (2 * day),
                end: today + (6 * day),
                completed: {
                    amount: 0.2
                }
            }, {
                taskName: 'Inspect building',
                id: 'inspect_building',
                dependency: 'prepare_building',
                parent: 'new_offices',
                start: today + 6 * day,
                end: today + 8 * day
            }, {
                taskName: 'Passed inspection',
                id: 'passed_inspection',
                dependency: 'inspect_building',
                parent: 'new_offices',
                start: today + 9.5 * day,
                milestone: true
            }, {
                taskName: 'Relocate',
                id: 'relocate',
                dependency: 'passed_inspection',
                parent: 'new_offices',
                start: today + 10 * day,
                end: today + 14 * day
            }, {
                taskName: 'Relocate staff',
                id: 'relocate_staff',
                parent: 'relocate',
                start: today + 10 * day,
                end: today + 11 * day
            }, {
                taskName: 'Relocate test facility',
                dependency: 'relocate_staff',
                parent: 'relocate',
                start: today + 11 * day,
                end: today + 13 * day
            }, {
                taskName: 'Relocate cantina',
                dependency: 'relocate_staff',
                parent: 'relocate',
                start: today + 11 * day,
                end: today + 14 * day
            }]
        }]
    });

    spaceExpanded = getSpacing(chart);

    evObj = document.createEvent('Events');
    evObj.initEvent('click', true, false);
    chart.yAxis[0].ticks['4'].label.element.dispatchEvent(evObj);

    spaceCollapsed = getSpacing(chart);

    assert.equal(
        spaceCollapsed,
        spaceExpanded,
        'Space between two first ticks does not change after collapsing'
    );


    evObj = document.createEvent('Events');
    evObj.initEvent('click', true, false);
    chart.yAxis[0].ticks['4'].label.element.dispatchEvent(evObj);

    spaceExpanded = getSpacing(chart);

    assert.equal(
        spaceExpanded,
        spaceCollapsed,
        'Space between two first ticks does not change after expanding again'
    );
});
