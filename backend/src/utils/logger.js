const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
}

function formatTimestamp() {
	return new Date().toISOString()
}

function formatMessage(level, message, ...args) {
	const timestamp = formatTimestamp()
	const levelColor =
		level === 'ERROR'
			? colors.red
			: level === 'WARN'
				? colors.yellow
				: level === 'INFO'
					? colors.blue
					: colors.reset

	return `${colors.reset}[${timestamp}] ${levelColor}${level}${colors.reset} ${message} ${
		args.length > 0 ? JSON.stringify(args, null, 2) : ''
	}`
}

export const logger = {
	info: (message, ...args) => {
		console.log(formatMessage('INFO', message, ...args))
	},
	warn: (message, ...args) => {
		console.warn(formatMessage('WARN', message, ...args))
	},
	error: (message, ...args) => {
		console.error(formatMessage('ERROR', message, ...args))
	},
	debug: (message, ...args) => {
		if (process.env.DEBUG === 'true') {
			console.log(formatMessage('DEBUG', message, ...args))
		}
	},
}

