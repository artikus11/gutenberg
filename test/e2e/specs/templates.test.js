/**
 * Internal dependencies
 */
import {
	clickOnMoreMenuItem,
	newPost,
	visitAdmin,
	getEditedPostContent,
	clickBlockAppender,
	saveDraft,
} from '../support/utils';
import { activatePlugin, deactivatePlugin } from '../support/plugins';

describe( 'templates', () => {
	describe( 'Using a CPT with a predefined template', () => {
		beforeAll( async () => {
			await activatePlugin( 'gutenberg-test-plugin-templates' );
			await newPost( { postType: 'book' } );
		} );

		afterAll( async () => {
			await deactivatePlugin( 'gutenberg-test-plugin-templates' );
		} );

		it( 'Should add a custom post types with a predefined template', async () => {
			//Switch to Code Editor to check HTML output
			await clickOnMoreMenuItem( 'Code Editor' );

			// Assert that the post already contains the template defined blocks
			const textEditorContent = await page.$eval( '.editor-post-text-editor', ( element ) => element.value );
			expect( textEditorContent ).toMatchSnapshot();
		} );
	} );

	describe( 'With default post format assigned', () => {
		const STANDARD_FORMAT_VALUE = 0;

		async function setPostFormat( format ) {
			await visitAdmin( 'options-writing.php' );
			await page.select( '#default_post_format', format );
			return Promise.all( [
				page.waitForNavigation(),
				page.click( '#submit' ),
			] );
		}

		beforeAll( async () => await setPostFormat( 'image' ) );
		afterAll( async () => await setPostFormat( STANDARD_FORMAT_VALUE ) );

		it( 'should populate new post with default block for format', async () => {
			await newPost();

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );

		it( 'should not populate edited post with default block for format', async () => {
			await newPost();

			// Remove the default block template to verify that it's not
			// re-added after saving and reloading the editor.
			await page.type( '.editor-post-title__input', 'My Image Format' );
			await clickBlockAppender();
			await page.keyboard.press( 'Backspace' );
			await page.keyboard.press( 'Backspace' );
			await saveDraft();
			await page.reload();

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );

		it( 'should not populate new page with default block for format', async () => {
			await newPost( { postType: 'page' } );

			expect( await getEditedPostContent() ).toMatchSnapshot();
		} );
	} );
} );
