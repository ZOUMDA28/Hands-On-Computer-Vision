export const GITHUB_OWNER = 'zoumda28'
export const GITHUB_REPO = 'Hands-On-Computer-Vision'
export const GITHUB_BRANCH = 'main'

export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
export const GITHUB_REPO_GIT_URL = `${GITHUB_REPO_URL}.git`

function getNotebookRoot(meta) {
  return 'notebooks'
}

export function getNotebookGitHubUrl(meta, notebookId) {
  return `${GITHUB_REPO_URL}/blob/${GITHUB_BRANCH}/${getNotebookRoot(meta)}/${meta?.partDir}/${notebookId}.ipynb`
}

export function getNotebookColabUrl(meta, notebookId) {
  return `https://colab.research.google.com/github/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${getNotebookRoot(meta)}/${meta?.partDir}/${notebookId}.ipynb`
}

export function getNotebookLaunchLinks(meta, notebookId) {
  return [
    {
      id: 'github',
      label: '在 GitHub 查看',
      href: getNotebookGitHubUrl(meta, notebookId),
    },
    {
      id: 'colab',
      label: '在 Colab 打开',
      href: getNotebookColabUrl(meta, notebookId),
    },
  ]
}
