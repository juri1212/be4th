import PageLayout from '../components/PageLayout';
import Tags from '../components/Tags';
import { PROJECTS, projectUrl } from '../content';

export default function Projects() {
  return (
    <PageLayout current="work">
      <header className="page-intro">
        <h1>Things I’ve built</h1>
        <p className="lede">A native app, a backend service and two web apps — each with a write-up of how it works.</p>
      </header>

      <ul className="project-list">
        {PROJECTS.map((project) => (
          <li key={project.slug}>
            <a className="project-row" href={projectUrl(project)}>
              <span className="project-row__body">
                <span className="project-row__meta">
                  {project.kind}, {project.year}
                </span>
                <span className="project-row__title">{project.title}</span>
                <span className="project-row__tagline">{project.tagline}</span>
              </span>
              <span className="project-row__stack">
                <Tags items={project.stack.slice(0, 4)} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </PageLayout>
  );
}
