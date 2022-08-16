export default function AcceptanceEmail() {
	return (
		<>
			<p>Congratulations on your acceptance to PTS!</p>
			<div style={{ width: '65ch' }}>
				<span>To access your account:</span>
				<ol style={{ marginTop: 0 }}>
					<li>Visit <a href="https://pts-new.vercel.app/">https://pts-new.vercel.app/</a></li>
					<li>Once the site loads, click the &ldquo;Tutor Login&rdquo; button on the upper right of the screen</li>
					<li>Log in with your registered DLSU email account</li>
				</ol>
			</div>
			<p>
				Once you have successfully logged in, please fill out your tutor details.
			</p>
		</>
	)
}
