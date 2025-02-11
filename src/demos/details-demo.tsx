import { Card, CardContent, CardHeader, CardTitle } from '~/shared/components/card';
import { Details } from '~/shared/components/details';

export function DetailsDemo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Details component</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="o-stack">
					<Details>
						{() => <>Click to expand</>}
						{() => (
							<>
								This is the content inside the details component. You can put any
								information here.
							</>
						)}
					</Details>
					<Details>
						{() => <>Here is another example</>}
						{() => (
							<div>
								<p>
									This time we have multiple paragraphs. Lorem ipsum dolor sit
									amet, consectetur adipiscing elit. Mauris fringilla dolor quis
									nisi iaculis varius. Quisque sit amet dui vel lorem dapibus
									consectetur. Maecenas pellentesque nibh diam, fringilla egestas
									massa fermentum eget. Morbi at erat vestibulum, laoreet risus
									id, vulputate nibh. In hac habitasse platea dictumst. Nulla sit
									amet augue varius, scelerisque quam in, consectetur nibh. Nam
									auctor mi ac efficitur tincidunt. Aenean rhoncus, quam nec
									cursus ultricies, tellus neque molestie dui, ut pellentesque
									risus justo et ex. Praesent semper metus lorem, eget volutpat
									odio imperdiet sed. Maecenas lobortis leo nec euismod convallis.
									Nullam justo sapien, porttitor eget auctor vitae, vestibulum ut
									erat. Nunc aliquam viverra leo. Suspendisse potenti. In hac
									habitasse platea dictumst. Etiam nulla mi, vestibulum ac rutrum
									tempus, accumsan quis nibh. Orci varius natoque penatibus et
									magnis dis parturient montes, nascetur ridiculus mus.
								</p>
								<p>
									Here is another paragraph. Ut a venenatis orci, ac efficitur
									magna. Maecenas blandit neque sed porta viverra. Suspendisse
									tincidunt sodales mi, eu tempor urna posuere eu. Phasellus
									maximus augue augue, id cursus leo rutrum ac. Cras urna tellus,
									consectetur eu sapien sed, mattis aliquet lectus. Nulla
									facilisi. Nulla a feugiat lorem. Nulla dignissim nisl ac odio
									dignissim pellentesque. Ut felis lectus, suscipit id laoreet
									quis, malesuada eget sem.
								</p>
							</div>
						)}
					</Details>
				</div>
			</CardContent>
		</Card>
	);
}
