import '~/lib/styles/index.css';

import { App } from '~/app';
import { mountRoot } from '~/lib/utility/solid/mount-root';
import { initUIPrefs } from '~/lib/utility/ui-prefs';

initUIPrefs();

function Main() {
	return (
		<App heading={<h1>Typography</h1>}>
			<main class="o-container o-stack">
				<h2>A Second Level Heading</h2>
				<p>
					We don't use <code>&lt;h1&gt;</code> elements outside of the top-level heading.
					When using text in a component, we use <code>&lt;h2&gt;</code> as the top-level.
					The HTML spec says (or used to say) that it's OK to use multiple{' '}
					<code>&lt;h1&gt;</code>s if they're within a <code>&lt;section&gt;</code> or{' '}
					<code>&lt;article&gt;</code> or whatever. But the outline algorithm that is
					supposed to reset headings for sections is, as of today,{' '}
					<a
						href="https://adrianroselli.com/2016/08/there-is-no-document-outline-algorithm.html
"
					>
						not implemented in any browser.
					</a>
				</p>
				<p>
					Here is another paragraph that we're add adding just to see how it looks with
					respect to spacing between paragraphs.
				</p>
				<h2>Another Second Level Heading</h2>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sed ligula
					sed mauris consequat ornare. Aenean ultricies hendrerit tellus, ac porttitor leo
					vulputate ac. Maecenas euismod euismod eros quis porta. Vivamus eu arcu nunc.
					Fusce sed felis quis nunc consequat sollicitudin eu eget dui. Integer dapibus
					mattis dignissim. Donec in mauris auctor, sollicitudin odio vel, ullamcorper
					arcu.
				</p>
				<h2>A Second Level Heading Followed By A Subheading</h2>
				<h3>Here's That Third Level Subheading</h3>
				<p>
					Phasellus placerat mi erat, eu faucibus sem pellentesque eu. Mauris condimentum
					suscipit sem eget faucibus. Duis sit amet nunc tincidunt, fringilla magna sit
					amet, viverra est.
				</p>
				<h3>Standalone Third Level Heading</h3>
				<p>
					Fusce sit amet nulla vel magna tempor dapibus. Integer ullamcorper diam ex, ac
					pulvinar massa porttitor a. Orci varius natoque penatibus et magnis dis
					parturient montes, nascetur ridiculus mus. Praesent ipsum orci, feugiat non
					sapien eu, molestie vestibulum arcu. Aenean condimentum risus quis condimentum
					imperdiet. Praesent finibus odio risus, non dictum mauris pulvinar sit amet.
					Nunc elementum tortor nec iaculis consectetur. Interdum et malesuada fames ac
					ante ipsum primis in faucibus.
				</p>
				<blockquote>
					"The best way to predict the future is to invent it." - Alan Kay
				</blockquote>
				<ul>
					<li>First item in an unordered list</li>
					<li>Second item in an unordered list</li>
					<li>
						<p>Nested list items</p>
						<ul>
							<li>First nested item in an unordered list</li>
							<li>Second nested item in an unordered list</li>
							<li>Third nested item in an unordered list</li>
						</ul>
					</li>
				</ul>
				<p>
					Phasellus placerat mi erat, eu faucibus sem pellentesque eu. Mauris condimentum
					suscipit sem eget faucibus. Duis sit amet nunc tincidunt, fringilla magna sit
					amet, viverra est.
				</p>
				<ol>
					<li>First item in an ordered list</li>
					<li>Second item in an ordered list</li>
					<li>Third item in an ordered list</li>
				</ol>
				<p>
					Phasellus placerat mi erat, eu faucibus sem pellentesque eu. Mauris condimentum
					suscipit sem eget faucibus. Duis sit amet nunc tincidunt, fringilla magna sit
					amet, viverra est.
				</p>
				<pre>{`function main() {\n\tconsole.log('Hello World');\n}`}</pre>
				<p>
					Phasellus placerat mi erat, eu faucibus sem pellentesque eu. Mauris condimentum
					suscipit sem eget faucibus. Duis sit amet nunc tincidunt, fringilla magna sit
					amet, viverra est.
				</p>
				<table>
					<thead>
						<tr>
							<th>Bird</th>
							<th>Habitat</th>
							<th>Diet</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Bald Eagle</td>
							<td>Forests, mountains, and near water</td>
							<td>Fish, small mammals</td>
						</tr>
						<tr>
							<td>Peregrine Falcon</td>
							<td>Urban areas, cliffs</td>
							<td>Birds, small mammals</td>
						</tr>
						<tr>
							<td>American Robin</td>
							<td>Woodlands, gardens</td>
							<td>Insects, fruits</td>
						</tr>
						<tr>
							<td>Great Horned Owl</td>
							<td>Forests, deserts, urban areas</td>
							<td>Small mammals, birds</td>
						</tr>
						<tr>
							<td>Ruby-throated Hummingbird</td>
							<td>Gardens, woodlands</td>
							<td>Nectar, insects</td>
						</tr>
					</tbody>
				</table>
			</main>
		</App>
	);
}

mountRoot(Main);
