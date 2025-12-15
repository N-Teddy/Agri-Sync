export const getAlertEmailTemplate = (data: {
	userName: string;
	alertTitle: string;
	alertMessage: string;
	severity: string;
	fieldName: string;
	triggeredAt: string;
	dashboardUrl: string;
}): string => {
	const severityColors = {
		low: '#10B981',
		medium: '#F59E0B',
		high: '#EF4444',
	};

	const severityColor =
		severityColors[data.severity as keyof typeof severityColors] ||
		'#6B7280';

	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Alert - AgriSync Pro</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .alert-box {
            background-color: #fef3c7;
            border-left: 4px solid ${severityColor};
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .alert-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 10px 0;
        }
        .alert-message {
            color: #4b5563;
            margin: 10px 0;
            font-size: 16px;
        }
        .alert-meta {
            display: table;
            width: 100%;
            margin-top: 20px;
        }
        .meta-row {
            display: table-row;
        }
        .meta-label {
            display: table-cell;
            padding: 8px 0;
            font-weight: 600;
            color: #6b7280;
            width: 40%;
        }
        .meta-value {
            display: table-cell;
            padding: 8px 0;
            color: #1f2937;
        }
        .severity-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            background-color: ${severityColor};
            color: #ffffff;
        }
        .cta-button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 30px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer-links {
            margin: 15px 0;
        }
        .footer-link {
            color: #10B981;
            text-decoration: none;
            margin: 0 10px;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .alert-box {
                padding: 15px;
            }
            .meta-label, .meta-value {
                display: block;
                width: 100%;
            }
            .meta-label {
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">🌱 AgriSync Pro</h1>
        </div>

        <div class="content">
            <p class="greeting">Hello ${data.userName},</p>

            <p>We've detected a weather condition that may affect your field. Please review the alert details below:</p>

            <div class="alert-box">
                <h2 class="alert-title">⚠️ ${data.alertTitle}</h2>
                <p class="alert-message">${data.alertMessage}</p>

                <div class="alert-meta">
                    <div class="meta-row">
                        <div class="meta-label">Field:</div>
                        <div class="meta-value">${data.fieldName}</div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">Severity:</div>
                        <div class="meta-value">
                            <span class="severity-badge">${data.severity}</span>
                        </div>
                    </div>
                    <div class="meta-row">
                        <div class="meta-label">Triggered:</div>
                        <div class="meta-value">${data.triggeredAt}</div>
                    </div>
                </div>
            </div>

            <p>We recommend checking your dashboard for more details and taking appropriate action to protect your crops.</p>

            <center>
                <a href="${data.dashboardUrl}" class="cta-button">View Dashboard</a>
            </center>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                💡 <strong>Tip:</strong> You can manage your notification preferences in your account settings.
            </p>
        </div>

        <div class="footer">
            <p><strong>AgriSync Pro</strong> - Smart Agriculture Management</p>
            <div class="footer-links">
                <a href="${data.dashboardUrl}" class="footer-link">Dashboard</a>
                <a href="${data.dashboardUrl}/settings" class="footer-link">Settings</a>
                <a href="${data.dashboardUrl}/help" class="footer-link">Help</a>
            </div>
            <p style="margin-top: 20px;">
                © ${new Date().getFullYear()} AgriSync Pro. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
};

export const getWeeklySummaryEmailTemplate = (data: {
	userName: string;
	weekStart: string;
	weekEnd: string;
	stats: {
		totalActivities: number;
		totalAlerts: number;
		avgTemperature: number;
		totalRainfall: number;
	};
	dashboardUrl: string;
}): string => {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Summary - AgriSync Pro</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }
        .subtitle {
            color: #E0E7FF;
            margin: 10px 0 0 0;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin: 10px 0;
        }
        .stat-label {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .cta-button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 30px 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">🌱 AgriSync Pro</h1>
            <p class="subtitle">Weekly Summary Report</p>
        </div>

        <div class="content">
            <p class="greeting">Hello ${data.userName},</p>

            <p>Here's your weekly summary for ${data.weekStart} - ${data.weekEnd}:</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Activities</div>
                    <div class="stat-value">${data.stats.totalActivities}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Alerts</div>
                    <div class="stat-value">${data.stats.totalAlerts}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Temperature</div>
                    <div class="stat-value">${data.stats.avgTemperature}°C</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Rainfall</div>
                    <div class="stat-value">${data.stats.totalRainfall}mm</div>
                </div>
            </div>

            <center>
                <a href="${data.dashboardUrl}" class="cta-button">View Full Dashboard</a>
            </center>
        </div>

        <div class="footer">
            <p><strong>AgriSync Pro</strong> - Smart Agriculture Management</p>
            <p style="margin-top: 20px;">
                © ${new Date().getFullYear()} AgriSync Pro. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
};
