import './index.scss';
const barConfig = [
  {
    name: 'FilterNone',
    icon: require('@material-ui/icons/FilterNone').default
  },
  {
    name: 'Github',
    icon: require('@material-ui/icons/Github').default
  },
  {
    name: 'Search',
    icon: require('@material-ui/icons/Search').default
  },
  {
    name: 'CropRotate',
    icon: require('@material-ui/icons/CropRotate').default
  }
]
function LeftBarItem(props: any) {
  const { barIcon: BarIcon } = props;
  return (
    <div className="left-bar-item">
      <BarIcon width={24} height={24}/>
    </div>
  )
}
export default function LeftBar(props: any) {
  return (
    <div className="vscode-left-bar">
      <div>
        {
          barConfig.map((item) => {
            return (
              <LeftBarItem  key={item.name} barIcon={item.icon}/>
            )
          })
        }
      </div>
      
    </div>
  )
}