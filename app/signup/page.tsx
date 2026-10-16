import AuthShell from '@/components/site/AuthShell';
import { DotList } from '@/components/site/SiteBits';
import auth from '@/components/site/auth.module.css';
import site from '@/components/site/site.module.css';
import SignupForm from './_components/SignupForm';
import styles from './_components/signup.module.css';

export default function SignupPage() {
  return (
    <AuthShell variant="signup">
      <h1 className={auth.title}>
        Start your family&apos;s <span className={site.accentPink}>story.</span>
      </h1>
      <p className={auth.intro}>
        Stories, voices, and the moments no photo can capture. All in one place your family can share and grow.
      </p>
      <div className={styles.dots}>
        <DotList items={['Free to start', 'No credit card', 'Two minutes']} />
      </div>

      <SignupForm />
    </AuthShell>
  );
}
