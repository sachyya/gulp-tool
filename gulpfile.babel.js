import del from 'del'; // Cleaning the folder during build or dev 
// import imagemin from 'gulp-imagemin';
import postcss from 'gulp-postcss'; // Plugin for auto prefixing the CSS
import autoprefixer from 'autoprefixer'; // Plugin for postcss. Need to work with postcss
import sourcemaps from 'gulp-sourcemaps'; // View the source of the styles or even the .scss files
import webpack from 'webpack-stream'; // Plugin of webpack to work on gulp which is used for scripts bundling here.
import named from 'vinyl-named'; // This is imported so that the array of js files could be passed 
// import $ from 'jquery';
import browserSync from 'browser-sync'; 

import { src, dest, watch, series, parallel } from 'gulp'; 
import yargs from 'yargs'; // To get argument from gulp commands
import sass from 'gulp-sass'; // Sass to CSS
import cleanCss from  'gulp-clean-css'; // Minify CSS
import gulpif from 'gulp-if'; // To apply confition regarding the prod and dev

const PRODUCTION = yargs.argv.prod;
const proxy = 'https://codemanas.loc/';

export const styles = () => {
	return src('src/scss/codemanas.scss')
		.pipe(gulpif(!PRODUCTION, sourcemaps.init()))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulpif(PRODUCTION, postcss([autoprefixer])))
		.pipe(gulpif(PRODUCTION, cleanCss({compatibility: 'ie8'})))
		.pipe(gulpif(!PRODUCTION, sourcemaps.write()))
		.pipe(dest('assets/css'))
		.pipe(server.stream());
}


// export const images = () => {
// 	return src('assets/img/*.{jpg, jpeg, png, svg, gif}')
// 		.pipe(gulpif(PRODUCTION, imagemin()))
// 		.pipe(dest('assets/imagesmin'));
// }

export const clean = () => del(['assets/css/**', 'assets/js/**', '!assets/{img,vendor}', '!assets/{img,vendor}/**/*']);

// export const copy = () => {
// 	return src(['src/**/*', '!src/{images,js,scss}', '!src/{images,js,scss}/**/*'])
// 	.pipe(dest('assets'));
// }

export const watchForChanges = () => {
	watch( 'src/scss/*.scss', styles );
	// watch( 'assets/img/*.{jpg, jpeg, png, svg, gif}', images );
	// watch( ['src/**/*', '!src/{images,js,scss}', '!src/{images,js,scss}/**/*'], series( /*copy*/, reload ) );
	watch('src/js/**/*.js', series( scripts, reload ) );
	watch( '**/*.php', reload );
}

export const scripts = () => {
	return src(['src/js/**'])
		.pipe(named())
		.pipe(webpack({
			module: {
				rules: [
				{
					test: /\.js$/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: []
						}
					}
				}
			]
		},
		mode: PRODUCTION ? 'production' : 'development',
		devtool: !PRODUCTION ? 'inline-source-maps' : false,
		output: {
			filename: '[name].js'
		}, 
		externals: {
			jquery: 'jQuery'
		},
	}))
	.pipe(dest('assets/js'))
}

const server = browserSync.create();
export const serve = done => {
	server.init({
		proxy: proxy
	});
	done();
}

export const reload = done => {
	server.reload();
	done();
}

export const dev = series(clean, parallel(styles, /*images, copy,*/ scripts), serve, watchForChanges);
export const build = series(clean, parallel(styles, /*images, copy,*/ scripts));
export default dev;
