import React from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
      paddingBottom: '10px'
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    },
    chip: {
      marginTop: '5px'
    }
  }),
);

export default function Dependencies(props: any) {
  const classes = useStyles({});
  const { data = {} } = props;
  const dependencies = Object.keys(data).map(depName => {
    return {
      name: depName,
      version: data[depName]
    }
  })
  const handleDelete = (dep: any) => {
    alert('You clicked the delete icon.');
  };

  const handleClick = () => {
    alert('You clicked the Chip.');
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {
          dependencies.map(dep => {
            return (
              <Chip
                key={`${dep.name}@${dep.version}`}
                size="small" 
                className={classes.chip} 
                variant="outlined" 
                label={`${dep.name}@${dep.version}`} 
                onDelete={() => handleDelete(dep)} 
                color="primary" />
            )
          })
        }
      </div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
      >
        add Dependencies
      </Button>
    </div>
  );
}
