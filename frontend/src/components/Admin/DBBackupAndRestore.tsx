import './style/DBBackupAndRestore.css'

export default function DBBackupAndRestore() {
  return (
    <div className='bd-backup-section'>
      <a href="/api/database" download>Get DB Backup</a>
    </div>
  )
}
